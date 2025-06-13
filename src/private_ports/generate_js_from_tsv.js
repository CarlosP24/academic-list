#!/usr/bin/env node

// generate_js_from_tsv.js
//
// This script converts a TSV (tab-separated values) file to a JSONP-style JavaScript file
// for use with dynamic publication/talk/event lists in web pages.
// It reads a TSV file, converts each row to an object, and writes a JS file that calls
// a callback function (e.g., tableFeed or talksFeed) with the data.
//
// Copyright (C) 2025  Carlos Payá
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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