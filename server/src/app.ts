import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
import { readFile } from 'node:fs/promises';

import { handleLogin, handleGoogleLogin, getUserById } from './server/auth';
import { generateJobs } from './scripts/insert-50-jobs-chatgpt';
import { resolvers } from './server/resolvers';
import { createDb } from './scripts/create-db';

import createLogger from './config/logger';
import { seedTable } from './db/seed/seedTable';
import { AuthRequest, authMiddleware } from './server/auth.cognito';
const logger = createLogger(__filename);

require('dotenv').config();

const app = express();
app.use(cors(), express.json());

app.post('/login', handleLogin);
app.post('/login/google', handleGoogleLogin);
app.get('/generate/jobs', generateJobs);
app.get('/create/db', createDb);
app.get('/seed/db', seedTable);
app.get('/user/:id', getUserById);

let apolloServer;

async function resolveSchema() {
  const typeDefs = await readFile('./src/schema.graphql', 'utf8');
  return typeDefs;
}

async function getContext({ req, res }: { req: AuthRequest, res: Response }) {
  const query = req.body.query;
  // console.log(`query: ${JSON.stringify(query, null, 2)}`);
  if (query && query.startsWith('mutation')) {
    await new Promise<void>((resolve, reject) => {
      authMiddleware.verifyToken(req, res, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  logger.info(`req.headers.authorization ${req.auth}`);
  return Promise.resolve({ auth: req.auth });
}

resolveSchema().then(async (tmpTypeDefs) => {
  logger.info('Schema resolved');
  apolloServer = new ApolloServer({ typeDefs: tmpTypeDefs, resolvers });
  await apolloServer.start();
  app.use('/graphql', apolloMiddleware(apolloServer, { context: getContext }));
});

export default app;
