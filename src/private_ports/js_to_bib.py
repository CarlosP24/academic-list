# js_to_bib.py
#
# This script extracts JSON data from a JSONP-style JavaScript file (such as table.js),
# converts each entry to a BibTeX record, and writes the result to a .bib file.
# It supports both local files and URLs as input.
#
# Copyright (C) 2025  Carlos Payá
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

import requests
import re
import sys
import json
from datetime import datetime
import os

def extract_json(js_text, callback):
    match = re.search(rf'{callback}\(\s*({{[\s\S]*?}})\s*\);', js_text)
    if not match:
        raise ValueError(f"Could not find {callback} JSON object in JS file.")
    return json.loads(match.group(1))

def bib_table(row):
    type_w_titles = ["Poster", "Oral", "Contributed"]
    outreach_types = ["Workshopper", "Logistics"]
    key = "".join(row.get("url_slug", "").split(" "))
    bib = f"@unpublished{{{key},\n"
    bib += f"title = {{{row.get('title', '')}}},\n"
    bib += f"venue = {{{row.get('venue', '')}, {row.get('location', '')}}},\n"
    date_str = row.get("date", "")
    if date_str:
        try:
            month, year = date_str.split(" ")
            month_num = datetime.strptime(month, "%B").strftime("%m")
            bib += f"month = {{{month_num}}},\n"
            bib += f"year = {{{year}}},\n"
        except Exception:
            pass
    type_ = row.get('type', '')
    bib += f"keywords = {{{type_}}},\n"
    if type_ in type_w_titles:
        bib += f"type = {{ {type_} title:}},\n"
        bib += f"note = {{{row.get('cont_title', '')}}},\n"
        bib += f"url = {{{row.get('pdf_url', '')}}},\n"
    elif type_ in outreach_types:
        bib += f"type = {{ Role:}},\n"
        bib += f"note = {{{type_.lower()}}},\n"
        bib += f"url = {{{row.get('talk_url', '')}}},\n"
    bib += f"}}\n"
    return bib


# Map mode to callback and bib function
MODES = {
    "table": ("tableFeed", bib_table),
}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python js_to_bib.py <mode> <js_url_or_path> [output.bib]")
        sys.exit(1)
    mode = sys.argv[1]
    js_input = sys.argv[2]
    output = sys.argv[3] if len(sys.argv) > 3 else f"{mode}.bib"

    if mode not in MODES:
        print(f"Unknown mode '{mode}'. Choose from: {', '.join(MODES.keys())}")
        sys.exit(1)

    callback, bib_func = MODES[mode]

    # Determine if input is a URL or a local file path
    if js_input.startswith("http://") or js_input.startswith("https://"):
        response = requests.get(js_input)
        js_text = response.text
    elif os.path.isfile(js_input):
        with open(js_input, "r", encoding="utf-8") as f:
            js_text = f.read()
    else:
        print(f"Input '{js_input}' is not a valid URL or file path.")
        sys.exit(1)

    data = extract_json(js_text, callback)
    entries = data.get("entries", [])

    with open(output, "w") as f:
        for row in entries:
            f.write(bib_func(row))

    print(f"Saved {output}")