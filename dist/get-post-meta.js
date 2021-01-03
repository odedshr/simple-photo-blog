"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFileOfType = exports.getVideoTag = exports.getItemContent = exports.getPostContent = exports.getPostMeta = exports.imageFileTypes = exports.videoFileTypes = void 0;
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
    const captionContent = getCaptionMap(captionFiles);
    const itemsWithoutCaptions = items.filter(item => !captionFiles.includes(item));
    const attachmentsWithCaptions = attachments.map(item => (Object.assign(Object.assign({}, item), { caption: captionContent[item.link] })));
    return {
        folder,
        target: '',
        title: folder.replace(tagsPattern, '').replace(pubDatePattern, '').trim(),
        slug: folder.replace(tagsPattern, '').trim().replace(/\s/g, '-').toLowerCase(),
        pubDate: getDateFromName(folder) || getDateFromFileState(source),
        tags: folder.match(tagsPattern) || [],
        items: itemsWithoutCaptions,
        attachments: attachmentsWithCaptions
    };
}
exports.getPostMeta = getPostMeta;
function filterCaptionElements(items, attachments) {
    const images = attachments.filter(item => item.type === 'image').map(item => item.link);
    return items
        .filter(item => !images.includes(item.link) &&
        images.includes(item.link.substr(0, item.link.lastIndexOf('.'))));
}
function getCaptionMap(items) {
    const captions = {};
    items.forEach(item => {
        captions[item.link.substr(0, item.link.lastIndexOf('.'))] = item.content || '';
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
    else if (isFileOfType(link, exports.videoFileTypes)) {
        return {
            link,
            type: 'video',
        };
    }
    else if (link.match(/\.video\.txt$/)) {
        return {
            link: fs_1.readFileSync(path_1.join(source, link), 'utf-8'),
            type: 'video',
        };
    }
    return {
        link,
        type: 'text',
        content: getTextContent(path_1.join(source, link))
    };
}
function formatDate(date) {
    return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function getDateFromName(name) {
    const match = name.match(pubDatePattern);
    return match ? formatDate(new Date(match[0])) : null;
}
function getDateFromFileState(fullPathFilename) {
    return formatDate(fs_1.statSync(fullPathFilename).ctime);
}
function getPostContent(post, path) {
    const captionFiles = filterCaptionElements(post.items, post.attachments);
    const captionContent = getCaptionMap(captionFiles);
    return post.items
        .filter(item => !captionFiles.includes(item))
        .map(item => getItemContent(path, item))
        .join('\n');
}
exports.getPostContent = getPostContent;
function getItemContent(path, item) {
    if (item.type === 'image') {
        return getImageTag(item);
    }
    else if (item.type === 'video') {
        return getVideoTag(item);
    }
    return `<div class="post_text">${item.content}</div>`;
}
exports.getItemContent = getItemContent;
function getImageTag(element) {
    const captionTag = element.caption ? `<figcaption class="post_image_caption">${element.caption}</figcaption>` : '';
    return `
  <figure class="post_picture">
    <img class="post_image" src="${element.link}" alt="${element.alt}"/>${captionTag}
  </figure>`;
}
function getVideoTag(element) {
    return `
  <video class="post_video" controls>
    <source src="${element.link}" type="video/mp4">
    😢 Your browser does not support the video tag.
  </video>`;
}
exports.getVideoTag = getVideoTag;
function getTextContent(file) {
    const content = fs_1.readFileSync(`${file}`, 'utf-8');
    switch (getFileType(file)) {
        case 'txt': return content.replace(/\n/g, '<br/>');
        case 'md': return md.render(content);
        default:
        case 'txt': return content;
    }
}
function getFileType(file) {
    if (file.toLowerCase().match(/\.video\.txt$/)) {
        return 'video.txt';
    }
    return path_1.extname(file).substr(1).toLowerCase();
}
function isFileOfType(file, types) {
    return types.indexOf(getFileType(file)) !== -1;
}
exports.isFileOfType = isFileOfType;
//# sourceMappingURL=get-post-meta.js.map