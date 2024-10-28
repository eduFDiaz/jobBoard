import { Job as GeneratedJob, generateJobPost } from '../server/langchainGen'; 

import { connection as getClient } from '../db/connection';

import { Request, Response } from 'express';
import { getCompanies } from '../db/company';
import { ulid } from 'ulid';
import { environment } from '../environment/environment';
import { DeleteItemCommand, BatchWriteItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Job } from '../db/jobs';

const client = getClient;

export async function generateJobs(req: Request, res: Response) {
  try {
    const INTERVAL = 4 * 60 * 60 * 1000; // 4h
    const START_TIME = new Date().getTime();
    
    // fetch array of company ids and pick one randomly;
    const companyIds = (await getCompanies()).map((company) => company.id);

    console.log(`[generateJobs] companyIds = ${companyIds}`);

    let jobs: Job[] = [];
    for (let n = 1; n <= 40; n++) {
      let fakeJob: GeneratedJob = { job_title: '', job_description: '' };
      
      try {
        fakeJob = await generateJobPost();
      } catch (error) {
        console.error(error);
        continue;
      }
      
      jobs.push(new Job(
          ulid(),
          companyIds[n % companyIds.length],
          fakeJob.job_title,
          fakeJob.job_description,
          new Date(START_TIME + n * INTERVAL).toISOString()
        )
      );
    }

    console.log(`[generateJobs] - jobs: ${JSON.stringify(jobs, null, 2)}`);

    // delete all job items and insert new ones

    //TODO: implement this as static method in Job class
    // client.send( new DeleteItemCommand({
    //   TableName: environment.TABLE_NAME,
    //   Key: { PK: { S: 'JOB' } }
    // }));
    
    //TODO: implement this as static method in Job class
    // await connection.table('job').insert(jobs);
    jobs.map((job) => {
      client.send( new PutItemCommand({
        TableName: environment.TABLE_NAME,
        Item: job.toItem(),
      }));
    });

    return res.json(jobs);
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

