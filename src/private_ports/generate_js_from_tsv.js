#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function tsvToJson(tsv) {
  const lines = tsv.trim().split('\n');
  const headers = lines[0].split('\t');
  return lines.slice(1).map(line => {
    const cols = line.split('\t');
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = cols[i] ? cols[i].trim().replace(/^"|"$/g, '') : '');
    return obj;
  });
}

function writeJsonp(filename, callbackName, data) {
  const js = `${callbackName}(${JSON.stringify({ entries: data }, null, 2)});`;
  fs.writeFileSync(filename, js);
}

// --- Main ---
if (process.argv.length < 4) {
  console.error('Usage: generate_js_from_tsv.js <input.tsv> <output.js>');
  process.exit(1);
}

const inputTsv = process.argv[2];
const outputJs = process.argv[3];

// Use the base name (without extension) as the callback name, e.g., talks.js -> talksFeed
const callbackName = path.basename(outputJs, path.extname(outputJs)) + 'Feed';

const tsv = fs.readFileSync(inputTsv, 'utf8');
const data = tsvToJson(tsv);
writeJsonp(outputJs, callbackName, data);