import chai, {expect} from 'chai';
import commonmark from 'commonmark';
import toDelta from '../src/toDelta';

describe('toDelta', () => {
  it('converts text with emphasis', () => {
    const input = 'Hello *world*';
    const expected = [{ insert: 'Hello '}, { insert: 'world', attributes: { "italic": true } }, { "insert": "\n" }];

    var reader = new commonmark.Parser();
    var parsed = reader.parse(input);
    var result = toDelta(parsed);

    expect(result).to.deep.equal(expected);
  });

  it('converts text with strong', () => {
    const input = 'Hello **world**';
    const expected = [{ insert: 'Hello '}, { insert: 'world', attributes: { "bold": true } }, { "insert": "\n" }];

    var reader = new commonmark.Parser();
    var parsed = reader.parse(input);
    var result = toDelta(parsed);

    expect(result).to.deep.equal(expected);
  });


  it('converts text with link', () => {
    const input = 'Hello [world](url)';
    const expected = [{ insert: 'Hello '}, { insert: 'world', attributes: { "link": 'url' } }, { "insert": "\n" }];

    var reader = new commonmark.Parser();
    var parsed = reader.parse(input);
    var result = toDelta(parsed);

    expect(result).to.deep.equal(expected);
  });
});
