import { v4 as uuidv4 } from 'uuid';
import { connection } from '../db/connection';
import { Company, generateCompany } from '../server/langchainGen';

import { Request, Response } from 'express';

export async function createDb(req:Request, res:Response) {
  try {
    const { schema } = connection;

    await schema.dropTableIfExists('user');
    await schema.dropTableIfExists('job');
    await schema.dropTableIfExists('company');

    await schema.createTable('company', (table) => {
      table.uuid('id').notNullable().primary();
      table.text('name').notNullable();
      table.text('description');
    });

    await schema.createTable('job', (table) => {
      table.uuid('id').notNullable().primary();
      table.uuid('companyId').notNullable().references('id').inTable('company');
      table.text('title').notNullable();
      table.text('description');
      table.text('createdAt').notNullable();
    });

    await schema.createTable('user', (table) => {
      table.uuid('id').notNullable().primary();
      table.uuid('companyId').notNullable().references('id').inTable('company');
      table.string('email').notNullable().unique();
      table.text('password').notNullable();
    });

    let companies = [];
    let companiesIds = [];
    for (let n = 1; n <= 5; n++) {
      const fakeCompany: Company = await generateCompany();
      const id = uuidv4();
      companies.push({
        id: id,
        name: fakeCompany.name,
        description: fakeCompany.description,
      });
      companiesIds.push(id);
    }
    await connection.table('company').insert(companies);

    await connection.table('user').insert([
      {
        id: uuidv4(),
        companyId: companiesIds[Math.floor(Math.random() * companiesIds.length)],
        email: 'alice@facegle.io',
        password: 'alice123',
      },
      {
        id: uuidv4(),
        companyId: companiesIds[Math.floor(Math.random() * companiesIds.length)],
        email: 'bob@goobook.co',
        password: 'bob123',
      },
    ]);
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
}
