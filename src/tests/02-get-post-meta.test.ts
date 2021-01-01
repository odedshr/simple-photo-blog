import * as assert from 'assert';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';


import { getPostMeta, getPostContent } from '../get-post-meta';
import { deleteFolderRecursive } from './utils';

let postName = '';
let postPath = '';
let testIndex = 0;

function getPostNameByTestIndex(index: number) {
  switch (index) {
    case 0: return 'sample-post';
    case 1: return '2020-01-01 sample-post';
    case 2: return '2020-01-01 sample-post #hashtag1 #hashtag2';
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

// describe('getPostMeta', () => {
//   beforeEach(beforeTest);
//   afterEach(afterTest);

//   it('should assign pubdDte automatically if not available', () => {
//     const post = getPostMeta(__dirname, postName);
//     assert.strictEqual(post.pubDate, (new Date()).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
//     assert.strictEqual(post.title, 'sample-post');
//   });

//   it('should assign pubDate from folder name', () => {
//     const post = getPostMeta(__dirname, postName);
//     assert.ok(post.pubDate, 'Wednesday, January 1, 2020');
//   });

//   it('should get hashtags from title', () => {
//     const post = getPostMeta(__dirname, postName);
//     assert.strictEqual(post.title, 'sample-post');
//     assert.strictEqual(post.tags.join(' '), '#hashtag1 #hashtag2');
//   });
// });

describe('getPostContent', () => {
  beforeEach(beforeTest);
  afterEach(afterTest);

  it('should return post content', () => {
    assert.strictEqual(
      getPostContent(getPostMeta(__dirname, postName), postPath), `
  <figure class="post_picture">
    <img class="post_image" src="00 image1.jpg" alt="image1"/>
  </figure>
<div class="post_text"><p>hello <em>foo</em></p>
</div>

  <figure class="post_picture">
    <img class="post_image" src="02 image2.jpg" alt="image2"/>
  </figure>
<div class="post_text">hello <u>bar</u></div>`
    );
  });

  it('should return post content', () => {
    writeFileSync(join(postPath, '04 video-link.video.txt'), 'my-vid-link.mp4', 'utf-8');
    writeFileSync(join(postPath, '05 vide-file.mp4'), '', 'utf-8');

    assert.strictEqual(
      getPostContent(getPostMeta(__dirname, postName), postPath), `
  <figure class="post_picture">
    <img class="post_image" src="00 image1.jpg" alt="image1"/>
  </figure>
<div class="post_text"><p>hello <em>foo</em></p>
</div>

  <figure class="post_picture">
    <img class="post_image" src="02 image2.jpg" alt="image2"/>
  </figure>
<div class="post_text">hello <u>bar</u></div>

  <video class="post_video" controls>
    <source src="04 video-link.video.txt" type="video/mp4">
    😢 Your browser does not support the video tag.
  </video>

  <video class="post_video" controls>
    <source src="05 vide-file.mp4" type="video/mp4">
    😢 Your browser does not support the video tag.
  </video>`
    );
  });

});