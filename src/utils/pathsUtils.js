import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');
export const publicDir = join(srcDir, 'public');
export const viewsDir = join(srcDir, 'views');
