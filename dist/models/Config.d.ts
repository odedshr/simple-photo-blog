export declare type Config = {
    modified: Date;
    source: string;
    target: string;
    indexTemplate: string;
    postTemplate: string;
    order: 'ascending' | 'descending';
    maxImageDimension: number;
    versionFile?: string;
    execute: string;
    cwd: string;
};
