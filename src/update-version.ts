import { existsSync, writeFileSync, readFileSync } from 'fs';

export function updateVersion(filename: string) {
  if (!existsSync(filename)) {
    console.error(` ⚠️ version file not found: ${filename}`);
    return;
  }
  const fileContent = readFileSync(filename, 'utf-8');

  try {
    const packageJson = JSON.parse(fileContent);
    const version = packageJson.version.split('.');

    version[2] = (+version[2]) + 1;
    packageJson.version = version.join('.');

    writeFileSync(filename, JSON.stringify(packageJson, null, 2), 'utf-8');
  } catch (err) {
    console.error(` ⚠️ failed to update version (${filename}):`, err);
    return;
  }

  console.info(`\n 🔢 Updated version`)
}
