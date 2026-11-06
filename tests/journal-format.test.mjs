import assert from 'node:assert/strict';
import test from 'node:test';
import {journalBlocks,journalInline,journalUrl,journalCoverUrl} from '../src/lib/journal/format.ts';

test('Reddit-style spoilers remain distinct from quotes and support source links after revealing',()=>{
 const blocks=journalBlocks('A thought >!identity reveal!< and a [source](https://example.org).\n\n>!A whole hidden paragraph.!<\n\n> A quotation');
 assert.equal(blocks[0].content.find(token=>token.type==='spoiler').text,'identity reveal');
 assert.equal(blocks[1].type,'paragraph');assert.equal(blocks[1].content[0].type,'spoiler');assert.equal(blocks[2].type,'quote');
 assert.equal(journalInline('>!A reveal with [evidence](https://example.org).!<')[0].type,'spoiler');
});
test('figures retain accessible descriptions and captions, while links and image destinations reject active content',()=>{
 const blocks=journalBlocks('![A museum object.](/journal/hades-ii/object.jpg)\nCredit: [Museum](https://example.org).\n\n::chart[greek-families]\nA source-labeled family map.');
 assert.equal(blocks[0].type,'image');assert.equal(blocks[0].alt,'A museum object.');assert.equal(blocks[0].caption[1].type,'link');assert.equal(blocks[1].type,'chart');
 for(const url of ['javascript:alert(1)','data:text/html,test','https://user:secret@example.org','/journal/../../secrets.png','/api/resources/session'])assert.equal(journalUrl(url,true),null,url);
 assert.equal(journalInline('[Unsafe](javascript:alert)')[0].type,'text');
 assert.equal(journalBlocks('![Unsafe](data:text/html,test)')[0].type,'paragraph');
 assert.equal(journalBlocks('::chart[../../secret]')[0].type,'paragraph');
 assert.equal(journalBlocks('<script>alert(1)</script>')[0].content[0].type,'text');
});

test('site-owned journal covers use the current preview origin while external covers retain their source',()=>{
 assert.equal(journalCoverUrl('https://andresnavesmauri.com/journal/hades-ii/stories-at-sea.webp'),'/journal/hades-ii/stories-at-sea.webp');
 assert.equal(journalCoverUrl('https://example.org/cover.webp'),'https://example.org/cover.webp');
 assert.equal(journalCoverUrl('https://andresnavesmauri.com.example.org/journal/cover.webp'),'https://andresnavesmauri.com.example.org/journal/cover.webp');
});

test('video blocks retain a title and source caption and only accept recognized YouTube videos', () => {
 const [video, shortLink, spoofedHost, invalidId, missingTitle] = journalBlocks([
  '::video[Official featurette](https://www.youtube.com/watch?v=Hysh_G5ZFM0&feature=share)\n[LAIKA](https://www.laika.com/)',
  '::video[Official featurette](https://youtu.be/Hysh_G5ZFM0)',
  '::video[Spoofed host](https://www.youtube.com.evil.example/watch?v=Hysh_G5ZFM0)',
  '::video[Bad ID](https://www.youtube.com/watch?v=bad-id)',
  '::video[](https://www.youtube.com/watch?v=Hysh_G5ZFM0)',
 ].join('\n\n'));
 assert.deepEqual(video, { type: 'video', id: 'Hysh_G5ZFM0', title: 'Official featurette', caption: [{ type: 'link', text: 'LAIKA', href: 'https://www.laika.com/' }] });
 assert.equal(shortLink.id, video.id);
 for (const block of [spoofedHost, invalidId, missingTitle]) assert.equal(block.type, 'paragraph');
});
