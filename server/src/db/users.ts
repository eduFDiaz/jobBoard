/* eslint-disable @typescript-eslint/return-await */
import { connection as getClient } from "./connection";
import { generateRandomPassword } from "./ids";
import { sendEmail } from "../server/send_email";
import { Item } from "./base";
import { environment } from "../environment/environment";
import { ulid } from "ulid";
import {
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  AttributeValue,
  TransactWriteItemsCommand,
  GetItemCommandOutput,
} from "@aws-sdk/client-dynamodb";

import createLogger from "../config/logger";
import { Company } from "./company";
import { generateCompany } from "../server/langchainGen";
import { Company as CompanyLangChain } from "../server/langchainGen";
const logger = createLogger(__filename);

const client = getClient;

export class User extends Item {
  id: string;
  email: string;
  name: string;
  companyId: string;
  password: string;

  constructor(
    id: string = ulid(),
    email: string,
    name: string,
    companyId: string = ulid(),
    password: string
  ) {
    super();
    this.id = id;
    this.email = email || "";
    this.name = name || "";
    this.companyId = companyId || "";
    this.password = password || "";
  }

  static mapItemToUser = (item: Record<string, AttributeValue>) => {
    return new User(
      item.PK.S?.toString().split("#")[1] || "",
      item.email.S || "",
      item.name.S || "",
      item.companyID.S || "",
      item.password.S || "",
    );
  };

  static fromItem(item: GetItemCommandOutput): User {
    if (!item) throw new Error("Item is undefined");

    const attributes = item.Item;
    if (!attributes) throw new Error("Attributes are undefined");

    return new User(
      attributes.PK.S?.toString().split("#")[1] || "",
      attributes.email?.S || "",
      attributes.name?.S || "",
      attributes.companyID?.S || "",
      attributes.password?.S || ""
    );
  }

  get pk(): string {
    return `USER#${this.id}`;
  }
  get sk(): string {
    return `USER#${this.id}`;
  }

  get gsi1pk(): string {
    return `USER#${this.email}`;
  }

  get gsi1sk(): string {
    return `USER`;
  }

  toItem() {
    return {
      ...this.keys(),
      ...this.gsi1Keys(),
      email: { S: this.email },
      name: { S: this.name },
      companyID: { S: this.companyId },
      password: { S: this.password },
      date: { S: new Date().toISOString() },
    };
  }
}

export const createUser = async (user: User): Promise<User> => {
  try {
    await client.send(
      new PutItemCommand({
        TableName: environment.TABLE_NAME,
        Item: user.toItem(),
      })
    );
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUser = async (id: string): Promise<User> => {
  const user = new User(id, "", "", "", "");

  // console.log(`[getUser] id: ${id} keys: ${JSON.stringify(user.keys(), null, 2)}`);

  try {
    const resp = await client.send(
      new GetItemCommand({
        TableName: environment.TABLE_NAME,
        Key: user.keys(),
      })
    );

    // console.log("[getUser] resp", resp);

    if (!resp.Item) {
      console.log("[getUser] user not found");
      return new User("", "", "", "", "");
    }

    // console.log("[getUser] user found", User.fromItem(resp));
    return User.fromItem(resp);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User> => {
  const user = new User("", email, "", "", "");

  // console.log("[getUserByEmail] user", user, user.gsi1Keys());

  try {
    const resp = await client.send(
      new QueryCommand({
        TableName: environment.TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pk AND GSI1SK = :sk",
        ExpressionAttributeValues: {
          ":pk": { S: user.gsi1pk },
          ":sk": { S: user.gsi1sk },
          ":email": { S: user.email },
        },
        FilterExpression: "email = :email",
      })
    );

    // console.log("[getUserByEmail] resp", resp);
    if (!resp.Items || resp.Items.length === 0) {
      return new User("", "", "", "", "");
    }

    // console.log("[getUserByEmail] User.mapItemToUser(resp.Items[0])", User.mapItemToUser(resp.Items[0]));

    return User.mapItemToUser(resp.Items[0]);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

function generateWelcomeEmail(user: User, company: Company) {
  logger.info(`Sending welcome email to ${user.email}`);

  const subject = "Welcome to our job board platform!";
  const html = `
    <h1>Welcome to our job board platform!</h1>
    <p>You have been registered with the email ${user.email}.</p>
    <p>Your password is: ${user.password}</p>
    <p>Company name: ${company.name}</p>
    <p>Company description: ${company.description}</p>
    <p>Please log in to your account and change your password.</p>
  `;
  const text = `Welcome to our job board platform!\n\n
  You have been registered with the email ${user.email}.\n
  Your password is: ${user.password}\n
  Company name: ${company.name}\n
  Company description: ${company.description}\n
  Please log in to your account and change your password.`;

  sendEmail(user.email, subject, text, html);
}

export function sendCompanyChangedOrCreatedEmail(user: User, company: Company) {
  logger.info(`Sending company changed or created email to ${user.email}`);

  const subject = "Company details changed";
  const html = `
    <h1>Company details changed</h1>
    <p>Your company details have been changed.</p>
    <p>Company name: ${company.name}</p>
    <p>Company description: ${company.description}</p>
  `;
  const text = `Company details changed\n\n
  Your company details have been changed.\n
  Company name: ${company.name}\n
  Company description: ${company.description}\n`;

  sendEmail(user.email, subject, text, html);
}

export async function createNewGoogleUser(email: string, name: string) {
  const newUserId = ulid();
  const newCompanyId = ulid();

  const companyRes: CompanyLangChain = await generateCompany();

  logger.info(`companyRes ${companyRes}`);

  const company = new Company(
    newCompanyId, 
    companyRes.name,
    `${companyRes.description}\n\n Random company name and description generated with chat-GPT-4o model.`,
  );

  const user: User = new User(
    newUserId,
    email,
    name,
    newCompanyId,
    await generateRandomPassword()
  );

  logger.info(`company ${company}`);
  logger.info(`user ${user}`);

  // Both the user and the company are created in a transaction
  // If one of them fails, the other one will not be created

  try {
    client.send( new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: environment.TABLE_NAME,
            Item: company.toItem(),
          },
        },
        {
          Put: {
            TableName: environment.TABLE_NAME,
            Item: user.toItem(),
          },
        },
      ],
    }));
    generateWelcomeEmail(user, company);
  } catch (error) {
    console.log(error);
    throw error;
  }

  return user;
}
