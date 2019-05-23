const { expect } = require('chai');

const Parser = require('./parser');

describe('Parser', () => {
  let sut;

  beforeEach(() => {
    sut = new Parser('https://subdomain.test.dev/');
  });

  it('ignores tag casing', () => {
    const html = `<html>
    <a href='http://subdomain.test.dev/path'>
    <A href='http://subdomain.test.dev/path/2'>
</html>`;
    const res = sut.parse(html, 'https://test.dev/');
    expect(res.links.length).to.equal(2);
  });

  it('it eliminates duplicates', () => {
    const html = `<html>
    <a href='https://subdomain.test.dev/path'>
    <a href='https://subdomain.test.dev/path'>
</html>`;
    const res = sut.parse(html, 'https://test.dev/');
    expect(res.links.length).to.equal(1);
  });

  it('it ignores hash and trailing slash', () => {
    const html = `<html>
    <a href='https://subdomain.test.dev/path/'>
    <a href='https://subdomain.test.dev/path'>
    <a href='https://subdomain.test.dev/path#something'>
</html>`;
    const res = sut.parse(html, 'https://test.dev/');
    expect(res.links.length).to.equal(1);
  });

  it('ignores non-http protocol urls', () => {
    const html = `<html>
    <a href='file://some/path'>
    <a href='http://subdomain.test.dev/path'>
    <a href='ftp://subdomain.test.dev/path/2'>
</html>`;
    const res = sut.parse(html, 'https://test.dev/');
    expect(res.links.length).to.equal(1);
  });

  it('ignores other subdomains or domains', () => {
    const html = `<html>
    <a href='http://other.test.dev/path'>
    <a href='http://subdomain.test.dev/path'>
    <a href='https://subdomain.test.dev/path'>
    <a href='https://www.anotherdomain.com/path'>
</html>`;
    const res = sut.parse(html, 'https://test.dev/');
    expect(res.links.length).to.equal(2);
  });
});
