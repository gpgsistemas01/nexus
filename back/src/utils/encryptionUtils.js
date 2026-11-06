import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const encryptPassword = async (password) => await bcrypt.hash(password, SALT_ROUNDS);

export const verifyPassword = async (password, hash) => await bcrypt.compare(password, hash);
