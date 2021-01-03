export declare type PostElement = {
    type: 'image' | 'video' | 'text';
    link: string;
    caption?: string;
    alt?: string;
    content?: string;
};
export declare type Post = {
    folder: string;
    title: string;
    slug: string;
    pubDate: string;
    target: string;
    content?: string;
    tags: string[];
    items: PostElement[];
    attachments: PostElement[];
};
