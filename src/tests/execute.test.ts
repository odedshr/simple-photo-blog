import * as assert from 'assert';
import { execute } from '../execute';
import { muteConsole, unmuteConsole } from './utils';

describe('Execute', () => {

  it('should execute a shell command', async () => {
    const origConsole = muteConsole();
    const result = (await execute(__dirname, 'pwd')).split('/').slice(-3).join('/');
    unmuteConsole(origConsole);

    assert.strictEqual(result, 'simple-photo-blog/dist/tests\n');
  });

  it('should reject when error', async () => {
    const origConsole = muteConsole();
    const result = await execute(__dirname, 'error').catch(err => err);
    unmuteConsole(origConsole);

    assert.strictEqual(result.message, 'Command failed: error\n/bin/sh: error: command not found\n');
  });
});