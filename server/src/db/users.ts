import { connection } from './connection.js';
import { v4 as uuidv4 } from 'uuid';
import { Company, generateCompany } from '../server/langchainGen.js'; 

const getUserTable = () => connection.table('user');

export async function getUser(id) {
  return await getUserTable().first().where({ id });
}

export async function getUserByEmail(email) {
  return await getUserTable().first().where({ email });
}

export async function createUser(email) {
  const newUserId = uuidv4();
  const newCompanyId = uuidv4();

  const companyRes:Company = await generateCompany();

  console.log('companyRes', companyRes);

  const company = {
    id: newCompanyId,
    name: companyRes.name,
    description:  `${companyRes.description}\n\n Random company name and description generated with chat-GPT-4o model. TODO://add form for new users to edit this.`,
  };

  const user = { 
    id: newUserId,
    companyId: newCompanyId,
    email: email,
    password: 'default-password',
  };

  console.log('company', company);
  console.log('user', user);

  await connection.table('company').insert(company);
  await connection.table('user').insert(user);
  return user;
}