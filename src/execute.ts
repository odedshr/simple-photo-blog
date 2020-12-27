
import { exec } from 'child_process';
import { Colors } from './colors';

export async function execute(cwd: string, action: string): Promise<string> {
  console.info(`\n 🕹  ${action}\n`);

  return new Promise((resolve, reject) => {
    exec(action, { cwd }, (error, stdout, stderr) => {

      if (error !== null) {
        console.error(` 🛑  ${Colors.FgRed}${error}${Colors.Reset}`);
        return reject(error);
      }

      console.info(' ✅ ', stdout, `${Colors.FgYellow}${stderr}${Colors.Reset}`);
      resolve(stdout);
    });
  });
}