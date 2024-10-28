import { environment }  from '../environment/environment';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {NodeHttpHandler} from "@aws-sdk/node-http-handler";

import createLogger from '../config/logger';
const logger = createLogger(__filename);

logger.info(`environment is ${JSON.stringify(environment)}`);

// Define an enum for the source types
export enum DataSource {
  DYNAMODB = 'dynamodb'
}

// Define a type for the function parameters
export type ConnectionSource = DataSource.DYNAMODB;

let client: DynamoDBClient;

// Function to generate the connection
function generateConnection(source: ConnectionSource): DynamoDBClient{
  console.log(`Client ${client}`);
  if (client) return client;

  if (source === DataSource.DYNAMODB) {
    
    let options = new NodeHttpHandler({
      connectionTimeout: 1000, // 5 seconds
      socketTimeout: 1000 // 5 seconds
    })

    const env = environment.production ? 'prod' : 'dev';
    console.log(`env is ${env}`);
    switch (env) {
      case 'dev':  
        client = new DynamoDBClient({
          region: environment.region,
          endpoint: environment.endpoint_url,
          requestHandler: options,
        });
        break;
      case 'prod':
        client = new DynamoDBClient({
          region: environment.region,
          requestHandler: options,
        });
        break;
      default:
        throw new Error(`Unsupported environment: ${env}`);
    }

    // console.log(`Client ${JSON.stringify(client)}`);
    return client;
  }

  // Throw an error if the source is not recognized
  throw new Error(`Unsupported source: ${source}`);
}

// Set the source using the enum
export const source: ConnectionSource = DataSource.DYNAMODB;

// Export the connection
export const connection = generateConnection(source);