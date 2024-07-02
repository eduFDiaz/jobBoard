export default interface CreateJobParams {
  companyId: string;
  input: {
    title: string;
    description: string;
  };
}

export interface UpdateJobParams extends CreateJobParams {
  id: string;
}

export interface User {
  id: string;
  companyId: string;
  email: string;
  password: string;
}

export interface Company {
  id: string;
  name: string;
  description: string;
}