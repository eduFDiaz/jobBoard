import {
  createJob,
  updateJob,
  deleteJob,
} from '../db/jobs';
import { createCompany, getCompanies, getCompany } from '../db/company';
import { GraphQLError } from 'graphql';
import { getUser } from '../db/users';
import { Job } from '../db/jobs';

function toISODate(date:string) {
  return date.slice(0, 'yyyy-mm-dd'.length);
}

function notFoundError(message:string) {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND' },
  });
}

function unauthorizedError(message:string) {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHORIZED' },
  });
}

export const resolvers = {
  Query: {
    company: async (_root: any, { id }: any) => {
      const company = await getCompany(id);
      if (!company) {
        return notFoundError(`There is no such company with id ${id}`);
      }
      // console.log(`company: ${JSON.stringify(company, null, 2)}`);
      return company;
    },
    jobs: async (_root: any, { limit, startKey }: any) => {
      const [jobs, lastKey, count ] = await Job.getJobs(limit, startKey);
      // const totalCount = await Job.countJobs();
      // console.log(`jobs: ${JSON.stringify(jobs, null, 2)}, count: ${count}`);
      return { jobs, lastKey, count  };
    },
    job: async (_root: any, { id }: { id: string }) => {
      const job = await Job.getJob(id);
      if (!job) {
        return notFoundError(`There is no such job with id ${id}`);
      }
      return job;
    },
    companies: async () => {  
      return await getCompanies();
    },
    searchCompany: async (_root: any, { name }: any) => {
      // TODO: replace this naive approach with a more sophisticated search implementation
      const companies = await getCompanies();
      return companies.filter((company) => company.name.toLowerCase().includes(name.toLowerCase()));
    },
    userById: async (_root: any, { id }: any) => {
      const user = await getUser(id);
      if (!user) {
        return notFoundError(`There is no such user with id ${id}`);
      }
      return user;
    }
  },

  Mutation: {
    createCompany: async (_root: any, { input }: any, { auth }: any) => {
      console.log(`Received input: ${JSON.stringify(input, null, 2)}`);
      if (!auth) {
        throw unauthorizedError('You must be logged in to create a company');
      }
      const company = await createCompany(input, auth.sub);
      return company;
    },
    createJob: async (_root: any, { input }: any, { auth }: any) => {
      // console.log(`[createJob] auth: ${JSON.stringify(auth, null, 2)}`);
      if (!auth) {
        throw unauthorizedError('You must be logged in to create a job');
      }
      const user = await getUser(auth.sub);
      // console.log(`[createJob] user: ${JSON.stringify(user, null, 2)}`);

      if (!user.companyId || user.companyId === 'COMPANY_PLACEHOLDER') {
        throw unauthorizedError('You must be associated with a company to create a job');
      }

      const job = await createJob({ companyId: user.companyId, input });
      return job;
    },
    updateJob: async (_root: any, { id, input }: any, { auth }: any) => {
      if (!auth) {
        throw unauthorizedError('You must be logged in to update a job');
      }
      const user = await getUser(auth.sub);
      if (!user.companyId || user.companyId === 'COMPANY_PLACEHOLDER') {
        throw unauthorizedError('You must be associated with a company to update a job');
      }
      const job = await updateJob(id, input, user.companyId);
      if (!job) {
        return notFoundError(`There is no such job with id ${id}`);
      }
      return job;
    },
    deleteJob: async (_root: any, { id }: any, { auth }: any) => {
      if (!auth) {
        throw unauthorizedError('You must be logged in to delete a job');
      }
      const user = await getUser(auth.sub);
      const job = await deleteJob(id);
      if (!job) {
        return notFoundError(`There is no such job with id ${id}`);
      }
      return job;
    },
  },

  Company: {
    jobs: (company: { id: any; }) => Job.getJobsByCompany(company.id),
  },

  Job: {
    date: (job: { date: string; }) => toISODate(job.date),
    company: (job: { companyId: any; }) => getCompany(job.companyId),
  },

  User: {
    company: (user: { companyId: any; }) => getCompany(user.companyId),
  },
};
