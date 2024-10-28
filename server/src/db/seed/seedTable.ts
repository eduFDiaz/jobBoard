import { DynamoDBClient, CreateTableCommand, DeleteTableCommand, DescribeTableCommand, PutItemCommand, waitUntilTableExists, waitUntilTableNotExists, ScalarAttributeType, KeyType, ProjectionType, BillingMode } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { jobTableData } from './data';
import { environment } from "../../environment/environment";
import { Request, Response } from 'express';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

// const REGION = 'us-west-2';
// const ENDPOINT = 'http://localhost:8000';
// const tableName = 'JobBoardTable';

const REGION = environment.region;
const ENDPOINT = environment.endpoint_url;
const tableName = environment.TABLE_NAME;

const client = new DynamoDBClient({ region: REGION, endpoint: ENDPOINT });
const docClient  = DynamoDBDocumentClient.from(client);

const doesTableExist = async (): Promise<boolean> => {
    try {
      await client.send(new DescribeTableCommand({ TableName: tableName }));
      return true;
    } catch (error: any) {
      if (error.name === "ResourceNotFoundException") {
        return false;
      }
      console.error("Error checking table existence:", error);
      throw error;
    }
  };

// Function to delete the DynamoDB table if it exists
const deleteTable = async () => {
    if (await doesTableExist()) {
      try {
        console.log(`Deleting table "${tableName}"...`);
        await client.send(new DeleteTableCommand({ TableName: tableName }));
        await waitUntilTableNotExists({ client, maxWaitTime: 60 }, { TableName: tableName });
        console.log(`Table "${tableName}" deleted successfully.`);
      } catch (error) {
        console.error("Error deleting table:", error);
        throw error;
      }
    } else {
      console.log(`Table "${tableName}" does not exist, skipping deletion.`);
    }
};

const createTable = async () => {
    const params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "PK", KeyType: KeyType.HASH }, // Partition key
            { AttributeName: "SK", KeyType: KeyType.RANGE }, // Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: "PK", AttributeType: ScalarAttributeType.S },
            { AttributeName: "SK", AttributeType: ScalarAttributeType.S },
            { AttributeName: "GSI1PK", AttributeType: ScalarAttributeType.S },
            { AttributeName: "GSI1SK", AttributeType: ScalarAttributeType.S },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "GSI1",
                KeySchema: [
                    { AttributeName: "GSI1PK", KeyType: KeyType.HASH },
                    { AttributeName: "GSI1SK", KeyType: KeyType.RANGE }
                ],
                Projection: {
                    ProjectionType: ProjectionType.ALL
                },
                BillingMode: BillingMode.PAY_PER_REQUEST
            }
        ],
        BillingMode: BillingMode.PAY_PER_REQUEST
    };
  
    try {
      console.log(`Creating table "${tableName}" with on-demand capacity...`);
      await client.send(new CreateTableCommand(params));
      await waitUntilTableExists({ client, maxWaitTime: 60 }, { TableName: tableName });
      console.log(`Table "${tableName}" created successfully.`);
    } catch (error: any) {
      if (error.name === "ResourceInUseException") {
        console.log(`Table "${tableName}" already exists.`);
      } else {
        console.error("Error creating table:", error);
        throw error;
      }
    }
  };

  const populateTable = async () => {
    const requests = jobTableData['RequestItems'][tableName];
  
    try {
      console.log(`Populating table "${tableName}" with sample data...`);
      for (const request of requests) {
        let item = unmarshall(request.PutRequest.Item);
        console.log(`Adding item: ${JSON.stringify(item, null, 2)}`);
        const params = {
          TableName: tableName,
          Item: item,
        };
        await docClient.send(new PutCommand(params));
      }
      console.log("Data population completed.");
    } catch (error) {
      console.error("Error populating table:", error);
      throw error;
    }
  };

export async function seedTable(req:Request, res:Response) {
    console.log('Seeding table');
    try {
        await deleteTable(); // Delete the table if it exists
        await createTable(); // Create the table after deletion
        await populateTable(); // Populate the table with sample data
        return res.status(200).send('Successfully seeded table');
      } catch (error) {
        console.error("An error occurred:", error);
        return res.status(500).send('Error seeding table');
      }
};