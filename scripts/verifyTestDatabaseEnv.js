import { pathToFileURL } from 'node:url';

const normalizeUrl = (url = '') => url.trim().replace(/\/+$/, '');

export const validateTestDatabaseEnv = ({
  databaseUrl = process.env.DATABASE_URL,
  databaseTestUrl = process.env.DATABASE_TEST_URL,
  directUrl = process.env.DIRECT_URL,
  directTestUrl = process.env.DIRECT_TEST_URL
} = {}) => {
  if (!databaseTestUrl) {
    throw new Error('DATABASE_TEST_URL is required to run database tests.');
  }

  if (!directTestUrl) {
    throw new Error('DIRECT_TEST_URL is required to run database migrations in tests.');
  }

  if (databaseUrl && normalizeUrl(databaseUrl) === normalizeUrl(databaseTestUrl)) {
    throw new Error('DATABASE_TEST_URL must point to a different database than DATABASE_URL.');
  }

  if (directUrl && directTestUrl && normalizeUrl(directUrl) === normalizeUrl(directTestUrl)) {
    throw new Error('DIRECT_TEST_URL must point to a different database than DIRECT_URL.');
  }

  if (directTestUrl && databaseUrl && normalizeUrl(directTestUrl) === normalizeUrl(databaseUrl)) {
    throw new Error('DIRECT_TEST_URL must point to a different database than DATABASE_URL.');
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
