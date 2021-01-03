export declare type Config = {
    source: string;
    target: string;
    indexTemplate: string;
    postTemplate: string;
    overwrite: boolean;
    order: 'ascending' | 'descending';
    maxImageDimension: number;
    versionFile?: string;
    execute: string;
    cwd: string;
};
