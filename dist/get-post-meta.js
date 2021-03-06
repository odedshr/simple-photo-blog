"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distinctSlugs = exports.isFileOfType = exports.getItemContent = exports.getPostContent = exports.getPostMeta = exports.imageFileTypes = exports.videoFileTypes = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
//@ts-ignore as @types remarkable throws compilation errors regarding EOL highlight.js
const remarkable_1 = require("remarkable");
const md = new remarkable_1.Remarkable();
exports.videoFileTypes = ['video.txt', 'mov', 'avi', 'mp4', 'mkv', 'mpg'];
exports.imageFileTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
const textFileTypes = ['txt', 'md', 'html'];
const blogFileTypes = [...exports.imageFileTypes, ...exports.videoFileTypes, ...textFileTypes];
const pubDatePattern = /^\d{4}[\.\/-]\d{1,2}[\.\/-]\d{1,2}/;
const tagsPattern = /#\S*/g;
function getPostMeta(parent, folder) {
    const source = `${parent}/${folder}`;
    const items = getPostItems(source);
    const attachments = items
        .filter(item => item.type === 'image' || item.type === 'video');
    const captionFiles = filterCaptionElements(items, attachments);
    const captionContent = getCaptionMap(source, captionFiles);
    const itemsWithoutCaptions = items
        .filter(item => !captionFiles.includes(item))
        .map(item => (Object.assign(Object.assign({}, item), { caption: captionContent[item.link] })));
    const attachmentsWithCaptions = attachments.map(item => (Object.assign(Object.assign({}, item), { caption: captionContent[item.link] })));
    const modified = fs_1.lstatSync(source).mtime;
    return {
        source,
        modified,
        title: folder.replace(tagsPattern, '').replace(pubDatePattern, '').trim(),
        slug: getSafeSlug(folder),
        pubDate: getDateFromName(folder) || formatDate(modified),
        tags: folder.match(tagsPattern) || [],
        items: itemsWithoutCaptions,
        attachments: attachmentsWithCaptions
    };
}
exports.getPostMeta = getPostMeta;
function getSafeSlug(folder) {
    const suggested = [folder
            .replace(tagsPattern, '')
            .replace(/"/g, '”')
            .trim()
            .replace(/[\s|-]+/g, '-')
            .toLowerCase()];
    let attempts = 0;
    return suggested.join('-');
}
function filterCaptionElements(items, attachments) {
    const images = attachments.filter(item => item.type === 'image').map(item => item.link);
    return items
        .filter(item => !images.includes(item.link) &&
        images.includes(item.link.substr(0, item.link.lastIndexOf('.'))));
}
function getCaptionMap(folder, items) {
    const captions = {};
    items.forEach(item => {
        captions[item.link.substr(0, item.link.lastIndexOf('.'))] = getTextContent(path_1.join(folder, item.link));
    });
    return captions;
}
function getPostItems(source) {
    return fs_1.readdirSync(source)
        .filter(item => isFileOfType(item, blogFileTypes))
        .sort()
        .map(toPostElements.bind(null, source));
}
function toPostElements(source, link) {
    if (isFileOfType(link, exports.imageFileTypes)) {
        return {
            link,
            type: 'image',
            alt: link.substr(0, link.lastIndexOf('.')).replace(/^\d+\s+/, '')
        };
    }
    else if (link.match(/\.video\.txt$/)) {
        return {
            link: fs_1.readFileSync(path_1.join(source, link), 'utf-8'),
            type: 'video',
        };
    }
    else if (isFileOfType(link, exports.videoFileTypes)) {
        return { link, type: 'video' };
    }
    return { link, type: 'text' };
}
function formatDate(date) {
    return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function getDateFromName(name) {
    const match = name.match(pubDatePattern);
    return match ? formatDate(new Date(match[0])) : null;
}
function getPostContent(post) {
    return post.items
        .map(item => getItemContent(item, post.source))
        .join('\n');
}
exports.getPostContent = getPostContent;
function getItemContent(item, folder, slug) {
    if (item.type === 'image') {
        return getImageTag(item, slug);
    }
    else if (item.type === 'video') {
        return getVideoTag(item, slug);
    }
    return `<div class="post_text">${getTextContent(path_1.join(folder, item.link))}</div>`;
}
exports.getItemContent = getItemContent;
function getImageTag(element, slug) {
    const captionTag = element.caption ? `<figcaption class="post_image_caption">${element.caption}</figcaption>` : '';
    const link = slug ? `${slug}/${element.link}` : element.link;
    return `
  <figure class="post_picture">
    <img class="post_image" src="${link}" alt="${element.alt}"/>${captionTag}
  </figure>`;
}
function getVideoTag(element, slug) {
    const link = (slug && element.link.indexOf('//') === -1) ? `${slug}/${element.link}` : element.link;
    if (link.indexOf('www.youtube.com') > -1) {
        return getYouTubeTag(link);
    }
    if (link.indexOf('vimeo.com') > -1) {
        return getVimeoTag(link);
    }
    return getVideoTagText(link);
}
function getTextContent(file) {
    const content = fs_1.readFileSync(`${file}`, 'utf-8');
    switch (getFileType(file)) {
        case 'txt': return content.replace(/\n/g, '<br/>');
        case 'md': return md.render(content);
        default:
        case 'txt': return content;
    }
}
function getYouTubeTag(link) {
    const match = link.match(/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?[\w\?‌​=]*)?/);
    const revisedLink = !match ? link : `https://www.youtube.com/embed/${match[1]}${match[2] ? match[2].replace(/^&(amp;)?/, '?') : ''}`;
    return `
  <iframe class="post_video"
    src ="${revisedLink}"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>`;
}
function getVimeoTag(link) {
    const videoID = link.split('/').pop();
    return `
  <iframe class="post_video"
    src="https://player.vimeo.com/video/${videoID}"
    frameborder = "0"
    allow = "autoplay; fullscreen"
    allowfullscreen> </iframe>`;
}
function getVideoTagText(link) {
    return `
  <video class="post_video" controls>
    <source src="${link}" type="video/${getFileExtension(link)}">
    😢 Your browser does not support the video tag.
  </video>`;
}
function getFileType(file) {
    if (file.toLowerCase().match(/\.video\.txt$/)) {
        return 'video.txt';
    }
    return getFileExtension(file);
}
function getFileExtension(file) {
    return path_1.extname(file).substr(1).toLowerCase();
}
function isFileOfType(file, types) {
    return types.indexOf(getFileType(file)) !== -1;
}
exports.isFileOfType = isFileOfType;
function distinctSlugs(posts) {
    let existing = {};
    return posts.map(post => {
        const slug = [post.slug];
        let attempt = 0;
        while (existing[slug.join('-')]) {
            slug[1] = `${++attempt}`;
        }
        existing[slug.join('-')] = post;
        return Object.assign(Object.assign({}, post), { slug: slug.join('-') });
    });
}
exports.distinctSlugs = distinctSlugs;
//# sourceMappingURL=get-post-meta.js.map