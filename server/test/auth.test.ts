import { handleLogin } from '../src/server/auth';
import { Request, Response } from 'express';

describe('handleLogin', () => {
  it('should respond with status 401 if user does not exist', async () => {
    const req: Request = {
      body: {
        email: 'nonexistent@example.com',
        password: 'password123',
      },
    } as Request;
    const res: Response = {
      sendStatus: jest.fn(),
    } as unknown as Response;

    jest.spyOn(require('../src/db/users'), 'getUserByEmail').mockResolvedValue(undefined);

    await handleLogin(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
  });

  it('should respond with 401 status if the password is not correct', async () => {
    const req: Request = {
      body: {
        email: 'existent@example.com',
        password: 'password123',
      },
    } as Request;
    let res: Response = {
      json: jest.fn(),
      sendStatus: jest.fn(),
    } as unknown as Response;

    jest.spyOn(require('../src/db/users'), 'getUserByEmail').mockResolvedValue({
      id: '123',
      email: 'existent@example.com',
      password: 'not the right password',
    });

    await handleLogin(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
  });

  it('should respond with status valid token if user exists', async () => {
    const req: Request = {
      body: {
        email: 'existent@example.com',
        password: 'password123',
      },
    } as Request;
    let res: Response = {
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(require('../src/db/users'), 'getUserByEmail').mockResolvedValue({
      id: '123',
      email: 'existent@example.com',
      password: 'password123',
    });

    await handleLogin(req, res);

    expect(res.json).toHaveBeenCalledWith({ token: expect.any(String) });
  });
  
});
