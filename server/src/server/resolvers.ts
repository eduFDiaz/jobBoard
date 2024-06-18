import { countJobs, getJob, getJobs, getJobsByCompany, createJob, updateJob, deleteJob } from '../db/jobs.js';
import { getCompany } from '../db/companies.js';
import { GraphQLError } from 'graphql';
import { getUser } from '../db/users.js';


export const resolvers = {
    Query: {
        company: async ( _root, { id } ) => {
            const company = await getCompany(id);
            if (!company) {
                return notFoundError(`There is no such company with id ${id}`);
            }
            return company;
        },
        jobs: async (_root, { limit, offset}) => {
            const jobs = await getJobs(limit, offset);
            const totalCount = await countJobs();
            return { jobs, totalCount };
        },
        job: async ( _root, { id }) => {
            const job = await getJob(id);
            if (!job) {
                return notFoundError(`There is no such job with id ${id}`);
            }
            return job;
        },
    },

    Mutation: {
        createJob: async ( _root, { input }, { auth } ) => {
            if(!auth) {
                throw unauthorizedError('You must be logged in to create a job');
            }
            const user = await getUser(auth.sub);
            const job = await createJob({ companyId: user.companyId, input });
            return job;
        },
        updateJob: async ( _root, { id, input }, { auth } ) => {
            if(!auth) {
                throw unauthorizedError('You must be logged in to update a job');
            }
            const user = await getUser(auth.sub);
            const job = await updateJob({ id, companyId: user.companyId, input });
            if (!job) {
                return notFoundError(`There is no such job with id ${id}`);
            }
            return job;
        },
        deleteJob: async ( _root, { id },  { auth } ) => {
            if(!auth) {
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
        jobs: (company) => getJobsByCompany(company.id),
    },

    Job: {
        date: (job) => toISODate(job.createdAt),
        company: (job) => getCompany(job.companyId),
    },
};

function toISODate(date) {
    return date.slice(0, 'yyyy-mm-dd'.length);
}

function notFoundError(message){
    return new GraphQLError(message, {
        extensions: { code: 'NOT_FOUND' },
    });
}

function unauthorizedError(message){
    return new GraphQLError(message, {
        extensions: { code: 'UNAUTHORIZED' },
    });
}