import express from 'express';
import cors from 'cors';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
import { readFile } from 'node:fs/promises';

import { authMiddleware, handleLogin, handleGoogleLogin } from './server/auth';
import { generateJobs } from './scripts/insert-50-jobs-chatgpt';
import { resolvers } from './server/resolvers';
import { createDb } from './scripts/create-db';

require('dotenv').config();

const app = express();
app.use(cors(), express.json(), authMiddleware);

app.post('/login', handleLogin);
app.post('/login/google', handleGoogleLogin);
app.get('/generate/jobs', generateJobs);
app.get('/create/db', createDb);

let apolloServer;

async function resolveSchema() {
  const typeDefs = await readFile('./src/schema.graphql', 'utf8');
  return typeDefs;
}

import { Request } from 'express';

interface AuthRequest extends Request {
  auth?: any;
}

async function getContext({ req }: { req: AuthRequest }) {
  console.log('req.auth', req.auth);
  return Promise.resolve({ auth: req.auth });
}

resolveSchema().then(async (tmpTypeDefs) => {
  apolloServer = new ApolloServer({ typeDefs: tmpTypeDefs, resolvers });
  await apolloServer.start();
  app.use('/graphql', apolloMiddleware(apolloServer, { context: getContext }));
});

export default app;
