# Sitemap builder

> A simple cli to crawl a website and build a simple sitemap for it.

## Run

First install [latest LTS](https://nodejs.org/en/download/) version of node.

Then:

```
npm install
```

## Usage

```
node . [options] <url>

# e.g.
node . -l 50 https://deliveroo.engineering
```

Options:

- `-i, --interval <n>`: Interval (in milliseconds) between each page visit. [100]
- `-l, --limit <n>`: Maximum number of pages to fetch. [Infinite]
- `-d, --depth <n>`: Maximum depth to crawl. [Infinite]
- `--dfs`: Set to crawl pagers in a depth first search fashion. [false]
- `-o, --output <p>`: Out path. If not given only prints to stdout.

## Test

```
npm test
```
