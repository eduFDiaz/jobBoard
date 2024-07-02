import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken';
import { getUserByEmail, createUser } from '../db/users';

const secretEnv = process.env.JOB_BOARD_SECRET;
if (!secretEnv) {
  throw new Error('JOB_BOARD_SECRET environment variable is not set');
}
const secret = Buffer.from(secretEnv, 'base64');

export const authMiddleware = expressjwt({
  algorithms: ['HS256'],
  credentialsRequired: false,
  secret,
});

import { Request, Response } from 'express';

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
  const { email } = req.body;
  let user = await getUserByEmail(email);
  if (!user) {
    // if the user does not exist, create a new user
    user = await createUser(email);
  }
  const claims = { sub: user.id, email: user.email, companyId: user.companyId };
  const token = jwt.sign(claims, secret);
  res.json({ token });  
}