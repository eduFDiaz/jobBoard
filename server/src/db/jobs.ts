/* eslint-disable @typescript-eslint/return-await */
import CreateJobParams, {
  UpdateJobParams,
} from "../interfaces/CreateJobParams";
import { connection as getClient } from "./connection";
import { generateId } from "./ids";
import {
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  DeleteItemCommand,
  AttributeValue,
  GetItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const client = getClient;

import createLogger from "../config/logger";
import { Item } from "./base";
import { ulid } from "ulid";
import { environment } from "../environment/environment";

const logger = createLogger(__filename);

export class Job extends Item {
  id: string;
  companyId: string;
  title: string;
  description: string;
  date: string;

  constructor(
    id: string = ulid(),
    companyId: string,
    title: string,
    description: string,
    date: string = new Date().toISOString()
  ) {
    super();
    this.id = id;
    this.companyId = companyId;
    this.title = title || "";
    this.description = description || "";
    this.date = date || "";
  }

  static fromItem(item: GetItemCommandOutput): Job {
    if (!item) throw new Error("Item is undefined");

    const attributes = item.Item;
    if (!attributes) throw new Error("Attributes are undefined");

    return new Job(
      attributes.PK.S?.toString().split("#")[1] || "",
      attributes.companyID?.S || "",
      attributes.title?.S || "",
      attributes.description?.S || "",
      attributes.date?.S || ""
    );
  }

  get pk(): string {
    return `JOB#${this.id}`;
  }
  get sk(): string {
    return `JOB#${this.id}`;
  }

  get gsi1pk(): string {
    return `JOB`;
  }

  get gsi1sk(): string {
    return new Date().toISOString();
  }

  static mapItemToJob = (item: Record<string, AttributeValue>) => {
    return {
      id: item.PK.S?.toString().split("#")[1] || "",
      companyId: item.companyID.S || "",
      title: item.title.S || "",
      description: item.description.S || "",
      date: item.date.S || "",
    };
  };

  toItem() {
    return {
      ...this.keys(),
      ...this.gsi1Keys(),
      companyID: { S: this.companyId },
      title: { S: this.title },
      description: { S: this.description },
      date: { S: this.date },
    };
  }

  static countJobs = async () => {
    const resp = await client.send(
      new GetItemCommand({
        TableName: environment.TABLE_NAME,
        Key: {
          GSI1: { S: `JOB` },
        },
        ProjectionExpression: "count",
      })
    );
    return resp.Item?.count?.N;
  };

  static getJobs = async (limit: number, startKey: any) => {
    // TODO: refactor this code to use best practices, its spaghetti code now :)
    // console.log(`[getJobs] - startKey ${JSON.stringify(marshall(startKey), null, 3)}`);
    if (startKey === null || startKey === undefined) {
      // console.log("[getJobs] - job is null or undefined", startKey);
      const resp = await client.send(
        new QueryCommand({
          TableName: environment.TABLE_NAME,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :pk",
          ExpressionAttributeValues: {
            ":pk": { S: "JOB" },
          },
          Limit: limit,
          ScanIndexForward: false, // new jobs first
        })
      );
      // console.log("[getJobs] - resp", resp);
      if (resp.Items) {
        return [
          resp.Items.map((item) => {
            //  console.log(JSON.stringify(Job.mapItemToJob(item), null, 2));
            return Job.mapItemToJob(item);
          }),
          resp.LastEvaluatedKey ? unmarshall(resp.LastEvaluatedKey) : undefined,
          resp.Count,
        ];
      }
    } else {
      // console.log("[getJobs] - job is not null or undefined", startKey);
      const resp = await client.send(
        new QueryCommand({
          TableName: environment.TABLE_NAME,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :pk",
          ExclusiveStartKey: marshall(startKey),
          ExpressionAttributeValues : {
            ":pk": { S: "JOB" },
          },
          Limit: limit,
          ScanIndexForward: false, // new jobs first
        })
      );
      // console.log("[getJobs] - resp", resp);
      if (resp.Items) {
        return [
          resp.Items.map((item) => {
            return Job.mapItemToJob(item);
          }),
          resp.LastEvaluatedKey ? unmarshall(resp.LastEvaluatedKey) : undefined,
          resp.Count,
        ];
      }
    }
    return [[], 0];
  };

  static getJobsByCompany = async (companyId: string) => {
    if (companyId === 'COMPANY_PLACEHOLDER') {
      return [];
    }

    const resp = await client.send(
      new QueryCommand({
        TableName: environment.TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pk",
        FilterExpression: "companyID = :companyID",
        ExpressionAttributeValues: {
          ":pk": { S: `JOB` },
          ":companyID": { S: companyId },
        },
        ScanIndexForward: false, // new jobs first
      })
    );
    // console.log("[getJobsByCompany] - resp", resp);
    if (resp.Items) {
      return resp.Items.map((item) => {
        // console.log(JSON.stringify(Job.mapItemToJob(item), null, 2));
        return Job.mapItemToJob(item);
      });
    }
  };

  static getJob = async (id: string) => {
    // console.log("[getJob] - job id", id);
    const resp = await client.send(
      new GetItemCommand({
        TableName: environment.TABLE_NAME,
        Key: {
          PK: { S: `JOB#${id}` },
          SK: { S: `JOB#${id}` },
        },
      })
    );
    // console.log("[getJob] - job resp", Job.fromItem(resp));
    return Job.fromItem(resp);
  };
}

export const createJob = async ({
  companyId,
  input: { title, description },
}: CreateJobParams): Promise<Job> => {
  const job = new Job(ulid(), companyId, title, description);

  // console.log(`[createJob] - job: ${JSON.stringify(job, null, 2)}`);
  try {
    await client.send(
      new PutItemCommand({
        TableName: environment.TABLE_NAME,
        Item: job.toItem(),
      })
    );
    return job;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteJob = async (id: string): Promise<Job> => {
  const job = await Job.getJob(id);
  try {
    await client.send(
      new DeleteItemCommand({
        TableName: environment.TABLE_NAME,
        Key: job.keys(),
      })
    );
    return job;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateJob = async (
  id: string,
  input: { title: string; description: string },
  companyId: string
): Promise<Job> => {
  let job = await Job.getJob(id);
  if (!job) {
    throw new Error(`Job not found: ${id}`);
  }

  if (job.companyId !== companyId) {
    throw new Error("Unauthorized");
  }

  job.title = input.title;
  job.description = input.description;

  await client.send(
    new PutItemCommand({
      TableName: environment.TABLE_NAME,
      Item: job.toItem(),
    })
  );
  return job;
};