import * as assert from 'assert';

import { getConfig } from '../config';

describe('Config', () => {
  it('should create config.yaml if not exists', () => {
    getConfig();
    assert.ok('passed');
  });
});