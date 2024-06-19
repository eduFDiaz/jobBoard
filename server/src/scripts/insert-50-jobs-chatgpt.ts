import { v4 as uuidv4 } from 'uuid';
import { Job, generateJobPost } from '../server/langchainGen.js'; 

import { connection } from '../db/connection.js';

export async function generateJobs(req, res) {
  try {
    const INTERVAL = 4 * 60 * 60 * 1000; // 4h
    const START_TIME = new Date().getTime();
    
    const companyIds = await connection.table('company').pluck('id');
  
    const jobs = [];
    for (let n = 1; n <= 50; n++) {
      let fakeJob: Job = { job_title: '', job_description: ''};
      
      try {
        fakeJob = await generateJobPost();
      } catch (error) {
        console.error(error);
        continue;
      }
      
      
      jobs.push({
        id: uuidv4(),
        companyId: companyIds[n % companyIds.length],
        title: fakeJob.job_title,
        description: fakeJob.job_description,
        createdAt: new Date(START_TIME + n * INTERVAL).toISOString(),
      });
    }

    await connection.table('job').truncate();
    await connection.table('job').insert(jobs);

    return res.json(jobs);
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

