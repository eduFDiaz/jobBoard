import { customAlphabet } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';
import { DataSource, source, ConnectionSource } from './connection.js';

// Function to generate the connection
function generateUniqueId(source: ConnectionSource):string{
    if (source === DataSource.SQLITE)
    {
        return customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)();
    }
    if (source === DataSource.MSSQL)
    {
        return uuidv4();
    }

    // Throw an error if the source is not recognized
    throw new Error(`Unsupported source: ${source}`);
}

// Export the id
export const generateId = () => {
    return generateUniqueId(source);
};

export const generateRandomPassword = () => {
    return customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)();
};