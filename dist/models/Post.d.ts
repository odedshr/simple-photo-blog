export declare type PostElement = {
    type: 'image' | 'video' | 'text';
    link: string;
    caption?: string;
    alt?: string;
};
export declare type Post = {
    source: string;
    modified: Date;
    title: string;
    slug: string;
    pubDate: string;
    tags: string[];
    items: PostElement[];
    attachments: PostElement[];
};
