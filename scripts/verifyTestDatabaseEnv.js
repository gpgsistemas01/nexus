import { pathToFileURL } from 'node:url';

const normalizeUrl = (url = '') => url.trim().replace(/\/+$/, '');

const requireEnv = (name, value, usage) => {
  if (!value) {
    throw new Error(`${name} is required to run ${usage} in tests.`);
  }
};

const assertDifferentDatabases = (leftName, leftValue, rightName, rightValue) => {
  if (leftValue && rightValue && normalizeUrl(leftValue) === normalizeUrl(rightValue)) {
    throw new Error(`${leftName} must point to a different database than ${rightName}.`);
  }
};

export const validateTestDatabaseEnv = ({
  databaseUrl = process.env.DATABASE_URL,
  databaseTestUrl = process.env.DATABASE_TEST_URL,
  directUrl = process.env.DIRECT_URL,
  directTestUrl = process.env.DIRECT_TEST_URL
} = {}) => {
  requireEnv('DATABASE_TEST_URL', databaseTestUrl, 'database service tests');

  assertDifferentDatabases('DATABASE_TEST_URL', databaseTestUrl, 'DATABASE_URL', databaseUrl);
  assertDifferentDatabases('DIRECT_TEST_URL', directTestUrl, 'DIRECT_URL', directUrl);
  assertDifferentDatabases('DIRECT_TEST_URL', directTestUrl, 'DATABASE_URL', databaseUrl);
  assertDifferentDatabases('DATABASE_TEST_URL', databaseTestUrl, 'DIRECT_URL', directUrl);
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
