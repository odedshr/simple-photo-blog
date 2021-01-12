import { Post } from './models/Post';
export declare function processPost(postTemplate: string, blogTitle: string, sourcePath: string, targetPath: string, maxImageDimension: number, expirationDate: Date, post: Post): Promise<Post>;
