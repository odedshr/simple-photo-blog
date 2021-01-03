import * as assert from 'assert';
import { renderIndex } from '../render-index';

describe('Render Index', () => {
  it('should render index page template', async () => {
    //@ts-expect-error
    const result = renderIndex(undefined, [{
      folder: '',
      title: 'title1',
      slug: 'slug1',
      pubDate: 'pubDate1',
      target: 'target1',
      tags: [],
      items: [],
      attachments: [{ type: 'image', link: 'image1.jpg', alt: 'image1' }]
    }]);
    assert.strictEqual(result, '')
  });

  it('should render index page template', async () => {
    const result = renderIndex('[<!-- content -->]', [
      {
        folder: '',
        title: 'title1',
        slug: 'slug1',
        pubDate: 'pubDate1',
        target: 'target1',
        tags: [],
        items: [],
        attachments: [{ type: 'image', link: 'image1.jpg', alt: 'image1' }]
      },
      {
        folder: '',
        title: 'title2',
        slug: 'slug2',
        pubDate: 'pubDate2',
        target: 'target2',
        tags: ['hashtag1', 'hashtag2'],
        items: [],
        attachments: [{ type: 'video', link: 'movie1.mov' }]
      }
    ]);

    assert.strictEqual(result, `[
  <li class="post">
    <a href="slug1" class="post_picture">
  <figure class="post_picture">
    <img class="post_image" src="slug1/image1.jpg" alt="image1"/>
  </figure></a>
    <a class="post_title" href="slug1">title1</a>
    <span class="post_pubDate">pubDate1</span>
    <ul class="post_tags"></ul>
  </li>

  <li class="post">
    <a href="slug2" class="post_picture">
  <video class="post_video" controls>
    <source src="slug2/movie1.mov" type="video/mp4">
    😢 Your browser does not support the video tag.
  </video></a>
    <a class="post_title" href="slug2">title2</a>
    <span class="post_pubDate">pubDate2</span>
    <ul class="post_tags"><li>hashtag1</li><li>hashtag2</li></ul>
  </li>]`);
  });
});