import { connection as getClient } from "./connection";
import {
  GetItemOutput,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  AttributeValue,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { ulid } from "ulid";
import { Item } from "./base";
import { environment } from "../environment/environment";
import { get } from "node:http";
import { getUser, sendCompanyChangedOrCreatedEmail } from "./users";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export class Company extends Item {
  id: string;
  name: string;
  description: string;

  constructor(id: string = ulid(), name: string, description: string) {
    super();
    this.id = id;
    this.name = name || "";
    this.description = description || "";
  }

  static fromItem(item: GetItemOutput): Company {
    if (!item) throw new Error("Item is undefined");

    const attributes = item.Item;
    if (!attributes) throw new Error("Attributes are undefined");

    return new Company(
      attributes.PK.S?.toString().split("#")[1] || "",
      attributes.name?.S || "",
      attributes.description?.S || ""
    );
  }

  get pk(): string {
    return `COMPANY#${this.id}`;
  }
  get sk(): string {
    return `COMPANY#${this.id}`;
  }

  get gsi1pk(): string {
    return `COMPANY`;
  }

  get gsi1sk(): string {
    return new Date().toISOString();
  }

  toItem() {
    return {
      ...this.keys(),
      ...this.gsi1Keys(),
      name: { S: this.name },
      description: { S: this.description },
    };
  }

  static mapItemToCompany = (item: Record<string, AttributeValue>): Company => {
    // console.log(`[mapItemToCompany] item: ${JSON.stringify(item, null, 2)}`);
    return new Company(
      item.PK.S?.toString().split("#")[1] || "",
      item.name.S || "",
      item.description.S || ""
    );
  };
}

export const getCompany = async (id: string): Promise<Company> => {
  // console.log("company id", id);
  const client = getClient;
  const company = new Company(id, "", "");
  if (id === "COMPANY_PLACEHOLDER") {
    return new Company(id, "", "");
  }

  try {
    const resp = await client.send(
      new GetItemCommand({
        TableName: environment.TABLE_NAME,
        Key: company.keys(),
      })
    );
    // console.log("company resp", resp);
    return Company.fromItem(resp);
  } catch (error) {
    console.error("Error getting company", error);
    throw error;
  }
};

export const getCompanies = async (): Promise<Company[]> => {
  const client = getClient;
  try {
    const resp = await client.send(
      new QueryCommand({
        TableName: environment.TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pk",
        ExpressionAttributeValues: {
          ":pk": { S: `COMPANY` },
        },
      })
    );
    // console.log("resp", resp);

    if (resp.Items) {
      return resp.Items.map((item) => {
        return Company.mapItemToCompany(item);
      });
    }
    return [];
  } catch (error) {
    console.error("Error getting companies", error);
    throw error;
  }
};

export const createCompany = async (companyInput: any, userId: string): Promise<Company> => {
    console.log("companyInput", companyInput);
    console.log("userId", userId);

    const client = getClient;

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (companyInput.id !== null) {
      // this means the new user wants to associate (him/her)self to an existing company
      // i.e. there is no need to create a new company, just to update the companyId of the user
      console.log("associating user to existing company");
      const user = await getUser(userId);
      console.log("user retrieved", user.toItem());
      console.log("user keys", user.keys());

      const company = await getCompany(companyInput.id);
      user.companyId = company.id;
      console.log("company retrieved", company.toItem());

        try {
            await client.send(
            new PutItemCommand({
                TableName: environment.TABLE_NAME,
                Item: user.toItem(),
            })
            );
            
            sendCompanyChangedOrCreatedEmail(user, company);
            return company;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    // if code reaches here, it means the user wants to create a new company
    console.log("creating new company");
    const company = new Company(ulid(), companyInput.name, companyInput.description);
    const user = await getUser(userId);
    user.companyId = company.id;
    
    // console.log("new company", company.toItem());
    // console.log("updating user", user.toItem());

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
                Update: {
                  TableName: environment.TABLE_NAME,
                  Key: user.keys(),
                  UpdateExpression: 'SET companyID = :companyId',
                  ExpressionAttributeValues: {
                    ':companyId': { S: company.id },
                  },
                },
              },
            ],
          }));
          sendCompanyChangedOrCreatedEmail(user, company);
        return company;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
