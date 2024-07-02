/* eslint-disable @typescript-eslint/return-await */
import CreateJobParams, { UpdateJobParams } from '../interfaces/CreateJobParams';
import { connection } from './connection';
import { generateId } from './ids';

const getJobTable = () => connection.table('job');

export async function countJobs() {
  const { count } = await getJobTable().first().count('*', { as: 'count' });
  return count;
}

export async function getJobs(limit: any, offset: any) {
  const query = getJobTable().select().orderBy('createdAt', 'desc');
  
  if (limit) {
    query.limit(limit);
  }

  if (offset) {
    query.offset(offset);
  }

  return await query;
}

export async function getJobsByCompany(companyId: any) {
  return await getJobTable().select().where({ companyId });
}

export async function getJob(id: string) {
  return await getJobTable().first().where({ id });
}

export async function createJob({ companyId, input: { title, description } }: CreateJobParams) {
  const job = {
    id: await generateId(),
    companyId,
    title,
    description,
    createdAt: new Date().toISOString(),
  };
  console.log(job);
  await getJobTable().insert(job);
  return job;
}

export async function deleteJob(id: any, companyId: any) {
  const job = await getJobTable().first().where({ id, companyId });
  if (!job) {
    throw new Error(`Job not found: ${id}`);
  }
  await getJobTable().delete().where({ id });
  return job;
}

export async function updateJob({ id, companyId, input: { title, description } }: UpdateJobParams) {
  const job = await getJobTable().first().where({ id, companyId });
  if (!job) {
    throw new Error(`Job not found: ${id}`);
  }
  const updatedFields = { title, description };
  await getJobTable().update(updatedFields).where({ id });
  return { ...job, ...updatedFields };
}