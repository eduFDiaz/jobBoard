const dev = {
  production: false,
  filename: './src/data/db.dev.sqlite3',
};

const prod = {
  production: true,
  filename: './src/data/db.prod.sqlite3',
};

function setEnvironment() {
  return process.env.NODE_ENV === "development" ? dev : prod;
}

export const environment = setEnvironment();


// TODO: create a cron job in the VPS to make backups of the database