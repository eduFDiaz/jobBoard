import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken';
import { getUserByEmail, createUser } from '../db/users.js';

const secret = Buffer.from('Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt', 'base64');

export const authMiddleware = expressjwt({
  algorithms: ['HS256'],
  credentialsRequired: false,
  secret,
});

export async function handleLogin(req, res) {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user || user.password !== password) {
    res.sendStatus(401);
  } else {
    const claims = { sub: user.id, email: user.email, companyId: user.companyId};
    const token = jwt.sign(claims, secret);
    res.json({ token });  
  }
}

export async function handleGoogleLogin(req, res) {
  const { email } = req.body;
  let user = await getUserByEmail(email);
  if (!user) {
    // if the user does not exist, create a new user
    user = await createUser(email);
  }
  const claims = { sub: user.id, email: user.email, companyId: user.companyId};
  const token = jwt.sign(claims, secret);
  res.json({ token });  
}