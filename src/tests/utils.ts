import { existsSync, unlinkSync, rmdirSync, readdirSync, lstatSync } from 'fs';
import { join } from 'path';

export function deleteIfExists(path: string) {
  existsSync(path) && unlinkSync(path);
}

export const deleteFolderRecursive = function (path: string) {
  if (existsSync(path)) {
    readdirSync(path).forEach(file => {
      const curPath = join(path, file);

      if (lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        unlinkSync(curPath);
      }
    });

    rmdirSync(path);
  }
};

export function muteConsole() {
  const error = console.error;
  const info = console.info;
  console.error = (...data: any[]) => { };
  console.info = (...data: any[]) => { };
  return { error, info };
}

export function unmuteConsole({ error, info }: { error: (...data: any[]) => void, info: (...data: any[]) => void }) {
  console.error = error
  console.info = info;
}