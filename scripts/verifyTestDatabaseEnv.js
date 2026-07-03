import { pathToFileURL } from 'node:url';

const normalizeUrl = (url = '') => url.trim().replace(/\/+$/, '');

export const validateTestDatabaseEnv = ({
  databaseUrl = process.env.DATABASE_URL,
  databaseTestUrl = process.env.DATABASE_TEST_URL
} = {}) => {
  if (!databaseTestUrl) {
    throw new Error('DATABASE_TEST_URL is required to run database tests.');
  }

  if (databaseUrl && normalizeUrl(databaseUrl) === normalizeUrl(databaseTestUrl)) {
    throw new Error('DATABASE_TEST_URL must point to a different database than DATABASE_URL.');
  }
};

const isExecutedDirectly = () => process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isExecutedDirectly()) {
  try {
    validateTestDatabaseEnv();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
