import {
  countJobs,
  getJob,
  getJobs,
  getJobsByCompany,
  createJob,
  updateJob,
  deleteJob,
} from '../db/jobs';
import { getCompany } from '../db/companies';
import { GraphQLError } from 'graphql';
import { getUser } from '../db/users';

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
      return company;
    },
    jobs: async (_root: any, { limit, offset }: any) => {
      const jobs = await getJobs(limit, offset);
      const totalCount = await countJobs();
      return { jobs, totalCount };
    },
    job: async (_root: any, { id }: { id: string }) => {
      const job = await getJob(id);
      if (!job) {
        return notFoundError(`There is no such job with id ${id}`);
      }
      return job;
    },
  },

  Mutation: {
    createJob: async (_root: any, { input }: any, { auth }: any) => {
      if (!auth) {
        throw unauthorizedError('You must be logged in to create a job');
      }
      const user = await getUser(auth.sub);
      const job = await createJob({ companyId: user.companyId, input });
      return job;
    },
    updateJob: async (_root: any, { id, input }: any, { auth }: any) => {
      if (!auth) {
        throw unauthorizedError('You must be logged in to update a job');
      }
      const user = await getUser(auth.sub);
      const job = await updateJob({ id, companyId: user.companyId, input });
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
      const job = await deleteJob(id, user.companyId);
      if (!job) {
        return notFoundError(`There is no such job with id ${id}`);
      }
      return job;
    },
  },

  Company: {
    jobs: (company: { id: any; }) => getJobsByCompany(company.id),
  },

  Job: {
    date: (job: { createdAt: string; }) => toISODate(job.createdAt),
    company: (job: { companyId: any; }) => getCompany(job.companyId),
  },
};
