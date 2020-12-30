export type Config = {
  source: string;
  target: string;
  indexTemplate: string;
  postTemplate: string;
  overwrite: boolean;
  order: 'ascending' | 'descending';
  versionFile?: string;
  execute: string;
  cwd: string;
};