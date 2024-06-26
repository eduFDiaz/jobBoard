import { handleLogin } from './auth';

describe('handleLogin', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    };
    res = {
      sendStatus: jest.fn(),
      json: jest.fn(),
    };
  });

  it('should send status 401 if user does not exist', async () => {
    jest.mock('../db/users', () => ({
        getUserByEmail: jest.fn().mockResolvedValueOnce(null),
        // Mock other exports from the module as needed
    }));
    
    await handleLogin(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
  });
});