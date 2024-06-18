import { ApolloServer } from '@apollo/server';
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
import { readFile } from 'node:fs/promises';
import { authMiddleware, handleLogin, handleGoogleLogin } from './src/server/auth.js'; 
import { resolvers } from './src/server/resolvers.js';
import { generateJobs } from './src/scripts/insert-50-jobs-chatgpt.js';
import { createDb } from './src/scripts/create-db.js';

const PORT = 9000;

const app = express();
app.use(cors(), express.json(), authMiddleware);

app.post('/login', handleLogin);
app.post('/login/google', handleGoogleLogin);
app.get('/generate/jobs', generateJobs);
app.get('/create/db', createDb);

const typeDefs = await readFile('./src/schema.graphql', 'utf8');

async function getContext({ req }) {
  console.log('req.auth', req.auth);
  return Promise.resolve({ auth: req.auth });
}

const apolloServer = new ApolloServer({ typeDefs, resolvers});
await apolloServer.start();
app.use('/graphql', apolloMiddleware(apolloServer, { context: getContext }));

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL server running at http://localhost:${PORT}/graphql`);
});
