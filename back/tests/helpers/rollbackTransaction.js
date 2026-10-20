const ROLLBACK_SIGNAL = Symbol('ROLLBACK_TEST_TRANSACTION');

export const withRollbackTransaction = async (prisma, callback) => {
  try {
    await prisma.$transaction(async (tx) => {
      await callback(tx);
      throw ROLLBACK_SIGNAL;
    });
  } catch (error) {
    if (error === ROLLBACK_SIGNAL) return;

    throw error;
  }
};
