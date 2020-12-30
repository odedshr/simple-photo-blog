import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import * as assert from 'assert';
import { updateVersion } from '../update-version';
import { deleteIfExists, muteConsole, unmuteConsole } from './utils';

describe('Update Version', () => {

  it('should throw an error if file not exists', async () => {
    const origConsole = muteConsole();
    let flag = false;
    console.error = (...data: any[]) => { flag = true; };
    updateVersion(join(__dirname, 'not-exists.json'));
    unmuteConsole(origConsole);
    assert.ok(flag);
  });

  it('should update file properly', async () => {
    const fileName = join(__dirname, 'version.json');
    writeFileSync(fileName, '{ "version": "1.0.0"}', 'utf-8');
    const origConsole = muteConsole();
    updateVersion(fileName);
    unmuteConsole(origConsole);
    assert.strictEqual(readFileSync(fileName, 'utf-8'), '{\n  "version": "1.0.1"\n}');
    deleteIfExists(fileName)
  });

  it('should throw an error if file not parsed properly', async () => {
    const fileName = join(__dirname, 'version.json');
    writeFileSync(fileName, '{ version: "1.0.0"}', 'utf-8');
    const origConsole = muteConsole();
    let flag = false;
    console.error = (...data: any[]) => { flag = true; };
    updateVersion(fileName);
    unmuteConsole(origConsole);
    assert.ok(flag);
  });
});