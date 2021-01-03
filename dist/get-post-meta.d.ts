import { Post, PostElement } from './models/Post';
export declare const videoFileTypes: string[];
export declare const imageFileTypes: string[];
export declare function getPostMeta(parent: string, folder: string): Post;
export declare function getPostContent(post: Post, path: string): string;
export declare function getItemContent(path: string, item: PostElement): string;
export declare function getVideoTag(element: PostElement): string;
export declare function isFileOfType(file: string, types: string[]): boolean;
