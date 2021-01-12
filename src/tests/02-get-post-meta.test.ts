import * as assert from 'assert';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { getPostMeta, getPostContent, getItemContent, distinctSlugs } from '../get-post-meta';
import { Post, PostElement } from '../models/Post';
import { deleteFolderRecursive } from './utils';

let postName = '';
let postPath = '';
let testIndex = 0;

function getPostNameByTestIndex(index: number) {
  switch (index) {
    case 0: return 'sample-post';
    case 1: return '2020-01-01 sample-post';
    case 2: return '2020-01-01 sample-post #hashtag1 #hashtag2';
    case 3: return '2020-01-01  abc--"abc" - abc';
    default:
      return 'sample-post';
  }
}

function beforeTest() {
  postName = getPostNameByTestIndex(testIndex++);
  postPath = join(__dirname, postName);

  mkdirSync(postPath);
  writeFileSync(join(postPath, '00 image1.jpg'), '', 'utf-8');
  writeFileSync(join(postPath, '00 image1.jpg.txt'), 'this is my caption', 'utf-8');
  writeFileSync(join(postPath, '01 md-file.md'), 'hello *foo*', 'utf-8');
  writeFileSync(join(postPath, '02 image2.jpg'), '', 'utf-8');
  writeFileSync(join(postPath, '03 html-file.html'), 'hello <u>bar</u>', 'utf-8');
}

function afterTest() {
  deleteFolderRecursive(postPath);
}

describe('getPostMeta', () => {
  beforeEach(beforeTest);
  afterEach(afterTest);

  it('should assign pubdDte automatically if not available', () => {
    const post = getPostMeta(__dirname, postName);
    assert.strictEqual(post.pubDate, (new Date()).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    assert.strictEqual(post.title, 'sample-post');
  });

  it('should assign pubDate from folder name', () => {
    const post = getPostMeta(__dirname, postName);
    assert.ok(post.pubDate, 'Wednesday, January 1, 2020');
  });

  it('should get hashtags from title', () => {
    const post = getPostMeta(__dirname, postName);
    assert.strictEqual(post.title, 'sample-post');
    assert.strictEqual(post.tags.join(' '), '#hashtag1 #hashtag2');
  });

  it('should provide safe slug', () => {
    const post = getPostMeta(__dirname, postName);
    assert.strictEqual(post.slug, '2020-01-01-abc-”abc”-abc');
  });

  it('should get image caption', () => {
    const post = getPostMeta(__dirname, postName);
    assert.strictEqual(post.attachments[0].caption, 'this is my caption');
  });
});

describe('getPostContent', () => {
  beforeEach(beforeTest);
  afterEach(afterTest);

  it('should return post content', () => {
    assert.strictEqual(
      getPostContent(getPostMeta(__dirname, postName)), `
  <figure class="post_picture">
    <img class="post_image" src="00 image1.jpg" alt="image1"/><figcaption class="post_image_caption">this is my caption</figcaption>
  </figure>
<div class="post_text"><p>hello <em>foo</em></p>
</div>

  <figure class="post_picture">
    <img class="post_image" src="02 image2.jpg" alt="image2"/>
  </figure>
<div class="post_text">hello <u>bar</u></div>`
    );
  });
});

describe('getItemContent', () => {
  beforeEach(beforeTest);
  afterEach(afterTest);

  it('should return postElement for local video', () => {
    writeFileSync(join(postPath, '05 vide-file.mp4'), '', 'utf-8');
    const postElement = getPostMeta(__dirname, postName).attachments.pop();


    !postElement ? assert.fail() : assert.strictEqual(getItemContent(postElement, postPath), `
  <video class="post_video" controls>
    <source src="05 vide-file.mp4" type="video/mp4">
    😢 Your browser does not support the video tag.
  </video>`);
  });

  it('should return postElement for local video link', () => {
    writeFileSync(join(postPath, '04 video-link.video.txt'), 'my-vid-link.mp4', 'utf-8');
    const postElement = getPostMeta(__dirname, postName).attachments.pop();


    !postElement ? assert.fail() : assert.strictEqual(getItemContent(postElement, postPath), `
  <video class="post_video" controls>
    <source src="my-vid-link.mp4" type="video/mp4">
    😢 Your browser does not support the video tag.
  </video>`);
  });

  it('should return postElement for youtube video', () => {
    writeFileSync(join(postPath, '04 youTube.video.txt'), 'https://www.youtube.com/watch?v=OOy764mDtiA', 'utf-8');
    const postElement = getPostMeta(__dirname, postName).attachments.pop();


    !postElement ? assert.fail() : assert.strictEqual(getItemContent(postElement, postPath), `
  <iframe class="post_video"
    src ="https://www.youtube.com/embed/OOy764mDtiA"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>`);
  });

  it('should return postElement for youtube video with time', () => {
    writeFileSync(join(postPath, '04 youTube.video.txt'), 'https://www.youtube.com/watch?v=OOy764mDtiA&t=1m', 'utf-8');
    const postElement = getPostMeta(__dirname, postName).attachments.pop();


    !postElement ? assert.fail() : assert.strictEqual(getItemContent(postElement, postPath), `
  <iframe class="post_video"
    src ="https://www.youtube.com/embed/OOy764mDtiA?t=1m"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>`);
  });

  it('should return postElement for embedded youtube video', () => {
    writeFileSync(join(postPath, '05 embedded-youTube.video.txt'), 'https://www.youtube.com/embed/OOy764mDtiA', 'utf-8');
    const postElement = getPostMeta(__dirname, postName).attachments.pop();


    !postElement ? assert.fail() : assert.strictEqual(getItemContent(postElement, postPath), `
  <iframe class="post_video"
    src ="https://www.youtube.com/embed/OOy764mDtiA"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>`);
  });

  it('should return postElement for vimeo video', () => {
    writeFileSync(join(postPath, '06 vimeo.video.txt'), 'https://vimeo.com/13687171', 'utf-8');
    const postElement = getPostMeta(__dirname, postName).attachments.pop();


    !postElement ? assert.fail() : assert.strictEqual(getItemContent(postElement, postPath), `
  <iframe class="post_video"
    src="https://player.vimeo.com/video/13687171"
    frameborder = "0"
    allow = "autoplay; fullscreen"
    allowfullscreen> </iframe>`);
  });
});

describe('distinctSlugs', () => {
  it('should provide distinct slugs', () => {
    const getPost = (): Post => ({ slug: 'item', source: '', modified: new Date(), title: '', items: [], attachments: [], tags: [], pubDate: '' });
    const slugs = distinctSlugs([
      getPost(),
      getPost(),
      getPost(),
    ]).map(post => post.slug).join(',');

    assert.strictEqual(slugs, 'item,item-1,item-2');
  });
});