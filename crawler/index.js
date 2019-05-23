require('isomorphic-fetch');

const Parser = require('./parser');

class Crawler {
  constructor(url, options) {
    const { depth = Infinity, limit, interval = 0, dfs = false } = options;
    this.options = { depth, limit, interval, dfs };

    this.parser = new Parser(url);

    // this is to standardize the starting url
    // the same way everything else is standardized.
    url = this.parser.resolver(url).href;
    this.queue = [{ url, depth: 0 }];
    this.queued = { [url]: true };
    this.dequeueCount = 0;
  }

  crawl() {
    return this._next();
  }

  _parse(raw, item) {
    const parsed = this.parser.parse(raw, item.url);

    // crawl deep into child pages
    if(item.depth < this.options.depth) {
      const childUrls = parsed.links
        .filter(url => !this.queued[url])
        .map(url => this.queue.push({ url, depth: item.depth + 1 }) && (this.queued[url] = true))
        ;
    }

    const result = { url: item.url, title: parsed.title }
    return Promise.resolve(result);
  }

  _next(res = []) {
    // if queue is empty, or reached the dequeue limit
    // break the chain loop.
    if(this.queue.length === 0 || this.dequeueCount >= this.options.limit) {
      return Promise.resolve(res);
    }

    // pick up something off the queue
    const item = this.options.dfs ? this.queue.pop() : this.queue.shift();
    this.dequeueCount++;

    console.info(`> [d:${item.depth}] ${item.url}`);

    return fetch(item.url)
      .then(response => response.text())
      .then(raw => this._parse(raw, item))
      .then(r => res.push(r))

      // run next visit with the specified delay
      .then(() => new Promise(resolve => setTimeout(() => this._next(res).then(resolve), this.options.interval)));
  }
}

module.exports = Crawler;
