import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken';
import { getUserByEmail, createUser, User, createNewGoogleUser, getUser } from '../db/users';

const secretEnv = process.env.JOB_BOARD_SECRET || 'testsecret';
const secret = Buffer.from(secretEnv, 'base64');

export const authMiddleware = expressjwt({
  algorithms: ['RS256'],
  credentialsRequired: false,
  secret,
});

import { Request, Response } from 'express';
import { getCompany } from '../db/company';

export async function getUserById(req: Request, res: Response) {
  const { id } = req.params;
  const user = await getUser(id);
  const company = await getCompany(user.companyId);
  if (!user) {
    res.sendStatus(404);
  } else {
    
    res.json({ 
      id: user.id,
      email: user.email,
      name: user.name,
      companyId: user.companyId,
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
      }
     });
  }
}

export async function handleLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user || user.password !== password) {
    res.sendStatus(401);
  } else {
    const claims = { sub: user.id, email: user.email, companyId: user.companyId };
    const token = jwt.sign(claims, secret);
    res.json({ token });  
  }
}

export async function handleGoogleLogin(req: Request, res: Response) {
  console.log(`[handleGoogleLogin] ${JSON.stringify(req.body, null, 2)}`);
  const { email, name } = req.body;
  let user = await getUserByEmail(email);
  if (!user.id) {
    // if the user does not exist, create a new user
    user = await createNewGoogleUser(email, name);
  }
  const claims = { sub: user.id, email: user.email, companyId: user.companyId };
  const token = jwt.sign(claims, secret);
  res.json({ token });  
}