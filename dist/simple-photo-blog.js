"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const Jimp = require("jimp");
const get_post_meta_1 = require("./get-post-meta");
const render_post_1 = require("./render-post");
const render_index_1 = require("./render-index");
const execute_1 = require("./execute");
const update_version_1 = require("./update-version");
function compile(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const postTemplate = fs_1.readFileSync(config.postTemplate, 'utf-8');
        const templateModified = fs_1.lstatSync(config.postTemplate).mtime;
        const lastModify = new Date(Math.max(templateModified.getTime(), config.modified.getTime()));
        const posts = yield Promise.all(getPostList(config.source, config.order === 'ascending')
            .map(get_post_meta_1.getPostMeta.bind(null, config.source))
            .filter(post => post.attachments.length)
            .map((post) => __awaiter(this, void 0, void 0, function* () { return processPost(postTemplate, config.source, config.target, config.maxImageDimension, lastModify, post); })));
        fs_1.writeFileSync(`${config.target}/index.html`, render_index_1.renderIndex(fs_1.readFileSync(config.indexTemplate, 'utf-8'), posts), 'utf-8');
        console.info(`\n ✅ Indexing complete for ${posts.length} posts`);
        if (config.versionFile) {
            update_version_1.updateVersion(config.versionFile);
        }
        if (config.execute && config.execute.length) {
            yield execute_1.execute(config.cwd, config.execute).catch(err => err);
        }
        return posts;
    });
}
exports.compile = compile;
// ================
function getPostList(source, sortAscending) {
    const files = fs_1.readdirSync(source)
        .filter((item) => fs_1.lstatSync(`${source}/${item}`).isDirectory())
        .sort();
    if (!sortAscending) {
        return files.reverse();
    }
    return files;
}
function processPost(postTemplate, sourcePath, targetPath, maxImageDimension, expirationDate, post) {
    return __awaiter(this, void 0, void 0, function* () {
        const { slug, folder } = post;
        const source = `${sourcePath}/${folder}`;
        const target = `${targetPath}/${slug}`;
        const postFile = `${target}/index.html`;
        const folderRequiresUpdate = isFolderRequireUpdate(source, target, expirationDate);
        const postModifyTime = getFileModifyDate(postFile);
        // if post index didn't exist, create it
        if (!folderRequiresUpdate) {
            console.info(`\n ✓ Skipping ${slug}`);
            return post;
        }
        console.info(`\n 💾 Writing ${slug}`);
        !fs_1.existsSync(target) && fs_1.mkdirSync(target);
        yield copyPostAttachments(post.attachments, source, target, maxImageDimension);
        if (!postModifyTime || postModifyTime > expirationDate) {
            const content = get_post_meta_1.getPostContent(post);
            fs_1.writeFileSync(`${target}/index.html`, render_post_1.renderPost(postTemplate, post, content), 'utf-8');
        }
        return post;
    });
}
function isFolderRequireUpdate(source, target, expirationDate) {
    const sourceModifyTime = getFileModifyDate(source);
    const targetModifyTime = getFileModifyDate(target);
    return !targetModifyTime ||
        targetModifyTime.getTime() < expirationDate.getTime() ||
        !sourceModifyTime ||
        sourceModifyTime.getTime() > targetModifyTime.getTime();
}
function getFileModifyDate(file) {
    if (fs_1.existsSync(file)) {
        return fs_1.lstatSync(file).mtime;
    }
    return false;
}
function copyPostAttachments(attachments, source, target, maxImageDimension) {
    return __awaiter(this, void 0, void 0, function* () {
        const updates = yield Promise.all(attachments
            .map((attachment) => __awaiter(this, void 0, void 0, function* () {
            if (attachment.link.match(/\.video\.txt$/)) {
                return 0;
            }
            if (attachment.type === 'image' && !attachment.link.match(/\.svg$/) && maxImageDimension) {
                const image = yield Jimp.read(path_1.join(source, attachment.link));
                yield image.scaleToFit(maxImageDimension, maxImageDimension).writeAsync(path_1.join(target, attachment.link));
            }
            else {
                fs_1.copyFileSync(path_1.join(source, attachment.link), path_1.join(target, attachment.link));
            }
            return 1;
        })));
        return updates.reduce((sum, i) => (sum + i), 0);
    });
}
//# sourceMappingURL=simple-photo-blog.js.map