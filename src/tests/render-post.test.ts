import * as assert from 'assert';
import { renderPost } from '../render-post';

describe('Render Post', () => {

  it('should render post page template with hashtags nor content', async () => {
    const result = renderPost('[<!-- title -->, <!-- content --> <!-- pubDate --> <!-- tags -->]', {
      folder: '',
      title: 'title1',
      slug: 'slug1',
      pubDate: 'pubDate1',
      target: 'target1',
      tags: [],
      items: [],
      images: ['image1.jpg']
    });

    assert.strictEqual(result, '[title1,  pubDate1 ]');
  });

  it('should render post page template with content and hashtags', async () => {
    const result = renderPost('[<!-- title -->, <!-- content --> <!-- pubDate --> <!-- tags -->]', {
      folder: '',
      title: 'title2',
      slug: 'slug2',
      pubDate: 'pubDate2',
      target: 'target2',
      content: 'content2',
      tags: ['hashtag1', 'hashtag2'],
      items: [],
      images: ['image2.jpg']
    });

    assert.strictEqual(result, '[title2, content2 pubDate2 <li>hashtag1</li><li>hashtag2</li>]');
  });
});