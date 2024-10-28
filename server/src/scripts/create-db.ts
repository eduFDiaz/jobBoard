import { BatchWriteItemCommand, CreateTableCommand, DeleteTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { connection, connection as getClient } from '../db/connection';
import { Company as GenCompany, generateCompany } from '../server/langchainGen';

import { Request, Response } from 'express';
import { ulid } from 'ulid';
import { environment } from '../environment/environment';
import { User } from '../db/users';
import { generateRandomPassword } from '../db/ids';
import { Company } from '../db/company';

const client = getClient;

function describeTable(tableName: any) {
  return new Promise((resolve, reject) => {
      client.send(new DescribeTableCommand({ TableName: tableName }), function (err: any, data: unknown) {
          if (err) {
              reject(err);
          } else {
              resolve(data);
          }
      });
  });
}

function deleteTable(table: any) {
  return new Promise((resolve, reject) => {
      client.send(new DeleteTableCommand({ TableName: table }), function (err: any, data: unknown) {
          if (err) {
              reject(err);
          } else {
              resolve(data);
          }
      });
  });
}

function createTable(params: any) {
  return new Promise((resolve, reject) => {
      client.send(new CreateTableCommand(params), function (err: any, data: unknown) {
          if (err) {
              reject(err);
          } else {
              resolve(data);
          }
      });
  });
}

function recreateTable() {
  var tableName = environment.TABLE_NAME
  var params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: "PK", KeyType: "HASH" }, //Partition key
      { AttributeName: "SK", KeyType: "RANGE" }, //Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: "PK", AttributeType: "S" },
      { AttributeName: "SK", AttributeType: "S" },
      { AttributeName: "GSI1PK", AttributeType: "S" },
      { AttributeName: "GSI1SK", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "GSI1",
        KeySchema: [
          { AttributeName: "GSI1PK", KeyType: "HASH" },
          { AttributeName: "GSI1SK", KeyType: "RANGE" },
        ],
        Projection: {
          ProjectionType: "ALL",
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  };

  describeTable(tableName)
    .then(() => {
        console.log('Table already exists');
        return deleteTable(tableName);
    })
    .then(() => {
        console.log('Successfully deleted table');
        return createTable(params);
    })
    .catch((err) => {
        console.error('Delete failed because table does not exist', err);
        createTable(params)
        .catch((err) => {
            console.error('Create failed', err);
        })
    });
}

export async function createDb(req:Request, res:Response) {
  try {
    recreateTable();

    let companies = [];
    let companiesIds = [];
    for (let n = 1; n <= 5; n++) {
      const fakeCompany: GenCompany = await generateCompany();
      const id = ulid();
      companies.push(
        new Company(id, fakeCompany.name, fakeCompany.description)
        );
      companiesIds.push(id);
    }

    // Put all companies in the database
    client.send( new BatchWriteItemCommand({
      RequestItems: {
        [environment.TABLE_NAME]: companies.map((cp) => ({
          PutRequest: {
            Item: cp.toItem(),
          },
        })),
      },
    }));
    
    let users:User[]  = [
      new User(ulid(), 'alice@facegle.io', 'Alice John', companiesIds[Math.floor(Math.random() * companiesIds.length)], await generateRandomPassword()),
      new User(ulid(), 'bob@goobook.co', 'Bob Smith', companiesIds[Math.floor(Math.random() * companiesIds.length)], await generateRandomPassword())
    ];

    // Put all users in the database
    client.send( new BatchWriteItemCommand({
      RequestItems: {
        [environment.TABLE_NAME]: users.map((user) => ({
          PutRequest: {
            Item: user.toItem(),
          },
        })),
      },
    }));

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
}
