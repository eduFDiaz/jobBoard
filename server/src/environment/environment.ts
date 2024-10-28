const dev = {
  production: false,
  filename: './src/data/db.dev.sqlite3',
  region: 'us-west-2',
  endpoint_url: 'https://dynamodb.us-west-2.amazonaws.com',
  TABLE_NAME: 'JobBoardTable',
  COGNITO_POOL_REGION : 'us-west-2',
  COGNITO_POOL_ID : 'us-west-2_YVqf9IMpe',
  COGNITO_CLIENT_ID : '3i10fvne3abg32ct4rs7h3nsh',
};

const prod = {
  production: true,
  filename: './src/data/db.prod.sqlite3',
  region: 'us-west-2',
  endpoint_url: 'https://dynamodb.us-west-2.amazonaws.com',
  TABLE_NAME: 'JobBoardTable',
  COGNITO_POOL_REGION : 'us-west-2',
  COGNITO_POOL_ID : 'us-west-2_YVqf9IMpe',
  COGNITO_CLIENT_ID : '3i10fvne3abg32ct4rs7h3nsh',
};

function setEnvironment() {
  return process.env.NODE_ENV === "development" ? dev : prod;
}

export const environment = setEnvironment();