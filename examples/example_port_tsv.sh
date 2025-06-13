#!/bin/bash

npm install 
chmod +x ../src/private_ports/generate_js_from_tsv.js
node ../src/private_ports/generate_js_from_tsv.js table.tsv table.js
