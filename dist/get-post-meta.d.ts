import { Post, PostElement } from './models/Post';
export declare const videoFileTypes: string[];
export declare const imageFileTypes: string[];
export declare function getPostMeta(parent: string, folder: string): Post;
export declare function getPostContent(post: Post): string;
export declare function getItemContent(item: PostElement, folder: string, slug?: string): string;
export declare function isFileOfType(file: string, types: string[]): boolean;
export declare function distinctSlugs(posts: Post[]): Post[];
