import * as assert from 'assert';
import { renderPost } from '../render-post';

describe('Render Post', () => {

  it('should render post page template with hashtags nor content', async () => {
    const result = renderPost('[<!-- blogTitle -->, <!-- title -->, <!-- content --> <!-- pubDate --> <!-- tags -->]', 'blogTitle', {
      source: '',
      modified: new Date(2020, 1, 1),
      title: 'title1',
      slug: 'slug1',
      pubDate: 'pubDate1',
      tags: [],
      items: [],
      attachments: [{ type: 'image', link: 'image1.jpg', alt: 'image1' }]
    }, '');

    assert.strictEqual(result, '[blogTitle, title1,  pubDate1 ]');
  });

  it('should render post page template with content and hashtags', async () => {
    const result = renderPost('[<!-- title -->, <!-- content --> <!-- pubDate --> <!-- tags -->]', '', {
      source: '',
      modified: new Date(2020, 1, 1),
      title: 'title2',
      slug: 'slug2',
      pubDate: 'pubDate2',
      tags: ['hashtag1', 'hashtag2'],
      items: [],
      attachments: [{ type: 'image', link: 'image2.jpg', alt: 'image2' }]
    }, '');

    assert.strictEqual(result, '[title2,  pubDate2 <li>hashtag1</li><li>hashtag2</li>]');
  });
});