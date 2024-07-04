import knex, { Knex } from 'knex';
import { environment }  from '../environment/environment';

import createLogger from '../config/logger';
const logger = createLogger(__filename);

logger.info(`environment is ${JSON.stringify(environment)}`);

// Define an enum for the source types
export enum DataSource {
  SQLITE = 'sqlite',
  MSSQL = 'mssql',
}

// Define a type for the function parameters
export type ConnectionSource = DataSource.SQLITE | DataSource.MSSQL;

// Function to generate the connection
function generateConnection(source: ConnectionSource): Knex {
  if (source === DataSource.SQLITE) {
    return knex({
      client: 'better-sqlite3',
      connection: {
        filename: environment.filename,
      },
      useNullAsDefault: true,
    });
  }

  if (source === DataSource.MSSQL) {
    return knex({
      client: 'mssql',
      connection: {
        user: 'sa',
        password: 'MSSQL123!',
        server: 'localhost',
        database: 'EXAMPLEDB',
        options: {
          encrypt: false,
          enableArithAbort: true,
        },
      },
    });
  }

  // Throw an error if the source is not recognized
  throw new Error(`Unsupported source: ${source}`);
}

// Set the source using the enum
export const source: ConnectionSource = DataSource.SQLITE;

// Export the connection
export const connection = generateConnection(source);