import { DataSource, source, ConnectionSource } from './connection';
import { generate } from 'generate-password'; 
import { ulid } from 'ulid';

// Function to generate the connection
async function generateUniqueId(dbSource: ConnectionSource): Promise<string> {
  if (dbSource === DataSource.DYNAMODB) {
    return ulid();
  }
  throw new Error(`Unsupported source: ${dbSource}`);
}

// Export the id
export const generateId = () => {
  return generateUniqueId(source);
};

export const generateRandomPassword = async () => {
  return generate({
    length: 10,
    numbers: true,
    symbols: true,
    uppercase: false,
    excludeSimilarCharacters: true,
    strict: true,
  });
};
