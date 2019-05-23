const cheerio = require('cheerio');
const _ = require('underscore');
const URL = require('url-parse');

class Parser {
  constructor(baseUrl){
    const { hostname } = new URL(baseUrl);

    this.filters = [
      httpProtocolFilter,
      domainFilterFactory(hostname)
    ];
    this.resolver = resolverFactory(baseUrl);
  }

  parse(html, url) {
    const $ = cheerio.load(html);

    const title = $('title').text().trim();
    let links = extractLinks($).map(this.resolver);
    links = _.unique(links, a => a.href);
    links = this.filters.reduce((r, f) => r.filter(f), links);

    return {
      title: title,
      links: links.map(u => u.href)
    }
  }
}

function resolverFactory(baseUrl) {
  return function(url) {
    // trim the trailing slash at the end
    // to avoid visiting a page twice -- e.g. '/' and ''
    // .
    var res = new URL(url, baseUrl).set('hash', '');
    res.href = res.href.replace(/\/$/, '');
    return res;
  };
}

function extractLinks($) {
  return $('a[href]')
    .map((ix, el) => $(el).attr('href'))
    .get()
    ;
}

function httpProtocolFilter(url) {
  return /^https?:$/i.test(url.protocol);
}

function domainFilterFactory(domain) {
  const matcher = new RegExp(`^${domain}$`, 'i');
  return function(url) {
    return matcher.test(url.hostname);
  }
}

module.exports = Parser;
