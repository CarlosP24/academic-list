#!/bin/bash

# Setup python environment
python3 -m venv venv
source venv/bin/activate
pip install requests

# Zotero url with format https://api.zotero.org/users/<user_id>/publications/items?format=bibtex . Finder your user_id for API calls at https://www.zotero.org/settings/security#applications
# This requires that your publication list is public at Zotero.org
python ../src/public_ports/port_Zotero.py "https://api.zotero.org/users/13410489/publications/items?format=bibtex" "Payá, Carlos" "output.bib"
python ../src/private_ports/js_to_bib.py table table.js table.bib

latexmk -synctex=1 -interaction=nonstopmode -file-line-error -lualatex fancy_pubs.tex

find . -maxdepth 1 -type f ! -name "*.pdf" ! -name "*.tex" -and \( -name "fancy_pubs.*" \) -exec rm {} +
