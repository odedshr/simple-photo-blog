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
      images: ['image1.jpg']
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
        images: ['image1.jpg']
      },
      {
        folder: '',
        title: 'title2',
        slug: 'slug2',
        pubDate: 'pubDate2',
        target: 'target2',
        tags: ['hashtag1', 'hashtag2'],
        items: [],
        images: ['image2.jpg']
      }
    ]);

    assert.strictEqual(result, '[\n' +
      '  <li class="post">\n' +
      '    <a href="slug1" class="post_picture">\n' +
      '      <img class="post_image"src="slug1/image1.jpg" alt="image1.jpg" />\n' +
      '    </a>\n' +
      '    <a class="post_title" href="slug1">title1</a>\n' +
      '    <span class="post_pubDate">pubDate1</span>\n' +
      '    <ul class="post_tags"></ul>\n' +
      '  </li>\n' +
      '\n' +
      '  <li class="post">\n' +
      '    <a href="slug2" class="post_picture">\n' +
      '      <img class="post_image"src="slug2/image2.jpg" alt="image2.jpg" />\n' +
      '    </a>\n' +
      '    <a class="post_title" href="slug2">title2</a>\n' +
      '    <span class="post_pubDate">pubDate2</span>\n' +
      '    <ul class="post_tags"><li>hashtag1</li><li>hashtag2</li></ul>\n' +
      '  </li>]');
  });
});