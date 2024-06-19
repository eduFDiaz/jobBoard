import { ChatOpenAI } from "@langchain/openai";

import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";


// Define your desired data structure. Only used for typing the parser output.
export interface Company {
  name: string;
  description: string;
}

export interface Job {
  job_title: string;
  job_description: string;
}

const job_titles = ["Software Engineer", "Software Developer", "Software Architect", "Software Analyst", "Software Manager", "Frontend developer", "Fullstack developer", "Backend developer", "Mobile developer", "Web developer", "DevOps Engineer", "Data Engineer", "Data Scientist", "Machine Learning Engineer", "AI Engineer", "Computer Vision Engineer", "NLP Engineer", "Software Engineer Intern", "Software Developer Intern", "Software Programmer Intern", "Software Architect Intern", "Software Analyst Intern", "Software Consultant Intern", "Software Specialist Intern", "Software Manager Intern", "Frontend developer Intern", "Fullstack developer Intern", "Backend developer Intern", "Mobile developer Intern", "Web developer Intern", "DevOps Engineer Intern", "Data Engineer Intern", "Data Scientist Intern", "Machine Learning Engineer Intern", "AI Engineer Intern", "Computer Vision Engineer Intern", "NLP Engineer Intern"];

// A query and format instructions used to prompt a language model.

export async function generateCompany(): Promise<Company> {
  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.9,
  });
  const companyQuery = "Generate a fake name for a Software company and its description.";
  const formatInstructions = "Respond with a valid JSON object, containing two fields: 'name' and 'description'.";

  // Set up a parser + inject instructions into the prompt template.
  const parser = new JsonOutputParser<Company>();

  const prompt = ChatPromptTemplate.fromTemplate(
    "Answer the user query.\n{format_instructions}\n{query}\n"
  );

  const partialedPrompt = await prompt.partial({
    format_instructions: formatInstructions,
  });

  const chain = partialedPrompt.pipe(model).pipe(parser);

  const companyResult:Company = JSON.parse(JSON.stringify(await chain.invoke({ query: companyQuery })));
  return companyResult;
}

export async function generateJobPost(): Promise<Job> {
  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.3,
  });
  const random_title = job_titles[Math.floor(Math.random() * job_titles.length)];

  const jobQuery = `Please generate a Job post with a description and title. 
        The job_title should be ${random_title}. For the job description please 
        use html for the format so that it can be rendered on a web page and include skills needed.
        The job description should be at least 300 words long.`;
  const formatInstructions = "Respond with a valid JSON object, containing two fields: 'job_title' and 'job_description'.";

  // Set up a parser + inject instructions into the prompt template.
  const parser = new JsonOutputParser<Company>();

  const prompt = ChatPromptTemplate.fromTemplate(
    "Answer the user query.\n{format_instructions}\n{query}\n"
  );

  const partialedPrompt = await prompt.partial({
    format_instructions: formatInstructions,
  });

  const chain = partialedPrompt.pipe(model).pipe(parser);

  const jobResult:Job = JSON.parse(JSON.stringify(await chain.invoke({ query: jobQuery })));
  return jobResult;
}