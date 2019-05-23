#!/usr/bin/env node

const fs = require('fs');
const program = require('commander');

const Crawler = require('./crawler');

program
  .version('0.0.1')
  .description('A simple crawler to extract static content accessible from a web page.')
  .usage('[options] <url>')
  .option('-i, --interval <n>', 'Interval (in milliseconds) between each page visit. [100]', 100, parseInt)
  .option('-l, --limit <n>', 'Maximum number of pages to fetch. [Infinite]', Infinity, parseInt)
  .option('-d, --depth <n>', 'Maximum depth to crawl. [Infinite]', Infinity, parseInt)
  .option('--dfs', 'If set, crawler will traverse links in a depth first search fashion', false)
  .option('-o, --output <p>', 'Out path. If not given only prints to stdout.')
  .parse(process.argv);

const url = program.args[0];
if(!url) {
  return console.error('Please specify a url!');
}

function generateOutput(result) {
  const URL = require('url-parse');

  // create a catalogue of all pages
  const catalogue = {};
  result.forEach(r => {
    const path = new URL(r.url).pathname.toLowerCase();
    catalogue[path] = { title: r.title, children: {} }
  });

  // turn the catalogue into a tree
  for(const path in catalogue) {
    const item = catalogue[path];

    const parts = path.split('/').filter(a => a.length > 0);
    for(let ix = 0; ix < parts.length; ix++) {
      const parentPath = parts.slice(0, -1 * ix).join('/');
      const parentNode = catalogue[parentPath];
      if(parentNode) {
        parentNode.children[path] = item;
        delete catalogue[path];
        break;
      }
    }
  }

  // print them into lines
  const lines = [];
  const iterateChildren = (node, depth = 0) => {
    Object.keys(node).sort((a, b) => a.length - b.length).forEach(path => {
      printLines(path, node[path], depth);
    });
  }
  const printLines = (path, node, depth) => {
    title = node.title;
    if(title.length > 30) {
      title = title.substring(0, 27) + '...'
    }

    lines.push(`${''.padStart(depth*2,' ')}${title} (${path})`);
    iterateChildren(node.children, depth + 1);
  }

  iterateChildren(catalogue);

  return lines.join('\n');
}

function print(result) {
  const output = generateOutput(result);

  if(!!program.output) {
    const path = program.output;
    fs.writeFile(path, output, err => {
      if(err) console.error('error when writing to file:', err);
      else console.log('output is written in:', path);
    });
  }
  else {
    console.log(output);
  }
}

new Crawler(url, program)
  .crawl()
  .then(print)
  .catch(e => console.error(e));
