import { v4 as uuidv4 } from 'uuid';
import { DataSource, source, ConnectionSource } from './connection';

// Function to generate the connection
async function generateUniqueId(dbSource: ConnectionSource): Promise<string> {
  if (dbSource === DataSource.SQLITE) {
    return uuidv4();
  }
  if (dbSource === DataSource.MSSQL) {
    return uuidv4();
  }

  // Throw an error if the source is not recognized
  throw new Error(`Unsupported source: ${dbSource}`);
}

// Export the id
export const generateId = () => {
  return generateUniqueId(source);
};

export const generateRandomPassword = async () => {
  return uuidv4();
};
