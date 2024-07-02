/* eslint-disable @typescript-eslint/return-await */
import { connection } from './connection';
import { v4 as uuidv4 } from 'uuid';
import { Company, generateCompany } from '../server/langchainGen'; 
import { generateRandomPassword } from './ids';
import { sendEmail } from '../server/send_email';
import { User } from '../interfaces/CreateJobParams';

const getUserTable = () => connection.table('user');

function generateWelcomeEmail(user: User, company: Company) {
  
  console.log('Sending welcome email to', user.email);

  const subject = 'Welcome to our job board platform!';
  const html = `
    <h1>Welcome to our job board platform!</h1>
    <p>You have been registered with the email ${user.email}.</p>
    <p>Your password is: ${user.password}</p>
    <p>Company name: ${company.name}</p>
    <p>Company description: ${company.description}</p>
    <p>Please log in to your account and change your password.</p>
  `;
  const text = `Welcome to our job board platform!\n\n
  You have been registered with the email ${user.email}.\n
  Your password is: ${user.password}\n
  Company name: ${company.name}\n
  Company description: ${company.description}\n
  Please log in to your account and change your password.`;

  sendEmail(user.email, subject, text, html);
}

export async function getUser(id:string) {
  return await getUserTable().first().where({ id });
}

export async function getUserByEmail(email:string) {
  return await getUserTable().first().where({ email });
}

export async function createUser(email:string) {
  const newUserId = uuidv4();
  const newCompanyId = uuidv4();

  const companyRes:Company = await generateCompany();

  console.log('companyRes', companyRes);

  const company = {
    id: newCompanyId,
    name: companyRes.name,
    description:  `${companyRes.description}\n\n Random company name and description generated with chat-GPT-4o model. TODO://add form for new users to edit this.`,
  };

  const user:User = { 
    id: newUserId,
    companyId: newCompanyId,
    email: email,
    password: await generateRandomPassword(),
  };

  console.log('company', company);
  console.log('user', user);

  await connection.table('company').insert(company);
  await connection.table('user').insert(user);

  generateWelcomeEmail(user, company);
  
  return user;
}
