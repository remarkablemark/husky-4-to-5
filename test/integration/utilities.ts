import fs from 'fs';

/**
 * Checks if path exists.
 */
export async function exists(path: string) {
  try {
    await fs.promises.access(path, fs.constants.F_OK);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

/**
 * Reads file as text.
 */
export async function readFile(path: string) {
  return fs.promises.readFile(path, 'utf8');
}
