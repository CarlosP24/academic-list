// port_tsv.js
//
// This script dynamically loads and displays a formatted list of talks or events from a JSONP-style data file (e.g., table.js).
// It categorizes entries by type (invited, contributed, poster, attended), formats details, and provides links to PDFs and references.
// Designed for embedding in web pages with minimal configuration.
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

function manageDefaults() {
    if (typeof talks_includeDescription === 'undefined') {
        talks_includeDescription = 0;
    }
    if (typeof talks_font_family === 'undefined') {
        talks_font_family = 'Lucida Grande,helvetica,arial,verdana,sans-serif';
    }
    if (typeof pdfcolor === 'undefined') {
        pdfcolor = '#BC4749';
    }
    if (typeof referencecolor === 'undefined') {
        referencecolor = '#05668D';
    }
    return 1;	
}

function htmlFix(html) {
    var re = new RegExp('&apos;', 'g');
    html = html.replace(re, '&#39;');
    return html;
}

// This function will be called by the data JS (JSONP style)
function tableFeed(feed) {
    manageDefaults();
    makeTalks(feed);
}

// Dynamically load js/table.js as a script
(function() {
    if (typeof js_src === 'undefined' || !js_src) {
        throw new Error('You must define a js_src variable with the path or URL to your table.js file.');
    }
    var headID = document.getElementsByTagName("head")[0];
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = js_src; 
    headID.appendChild(newScript);
})();

function makeTalks(feed) {
    var html = '<div id="arxivcontainer" style="font-family:' + talks_font_family + ';margin:.7em;font-size:90%">\n';
    html += '<dl style="margin:0;">\n';

    // Categorize talks by type
    var attended = [], poster = [], contributed = [], invited = [];
    feed.entries.forEach(function(entry) {
        var type = (entry.type || '').toLowerCase();
        if (type === 'attended') attended.push(entry);
        else if (type === 'poster') poster.push(entry);
        else if (type === 'contributed') contributed.push(entry);
        else if (type === 'invited') invited.push(entry);
    });

    // Prepare ordered categories
    var categories = [
        { name: "Invited Talks", entries: invited },
        { name: "Contributed Talks", entries: contributed },
        { name: "Poster Presentations", entries: poster },
        { name: "Attended Conferences/Workshops", entries: attended }
    ];

    // Reverse each category for chronological order (latest first in data, so reverse for earliest first)
    attended.reverse();
    poster.reverse();
    contributed.reverse();
    invited.reverse();

    // Single global counter
    var total = invited.length + contributed.length + poster.length + attended.length;
    var counter = total;

    function renderTalk(entry, counter) {
        var html = '';
        html += '<dt style="display:flex;align-items:flex-start;margin-bottom:0.25em;">';
        html += '<span style="display:inline-block;min-width:3.5em;text-align:right;font-family:monospace;">[C' + counter + ']</span>';
        html += '<span class="list-identifier" style="font-size:large;font-weight:bold;margin-left:0.5em;line-height:120%">';
        if (entry.talk_url) {
            html += '<a href="' + entry.talk_url + '" title="Event page" style="text-decoration:none;color:inherit;" target="_blank">' + htmlFix(entry.title) + '</a>';
        } else {
            html += htmlFix(entry.title);
        }
        html += '</span></dt>\n';

        html += '<dd style="margin:0 0 1em 0; padding:0 0 0 4.2em;">';
        html += '<div class="meta" style="line-height:130%;">\n';

        // Venue, date, location
        var details = [];
        if (entry.date) details.push(htmlFix(entry.date));
        if (entry.venue) details.push(htmlFix(entry.venue));
        if (entry.location) details.push(htmlFix(entry.location));
        if (details.length > 0) {
            html += '<div class="list-journal-ref" style="font-weight:normal;font-size:100%;text-decoration:none;">' + details.join(' — ') + '</div>\n';
        }
        // Description (if present)
        if (talks_includeDescription && entry.description) {
            html += '<div class="list-description" style="font-weight:normal;font-size:100%;margin-top:0.2em;">' + htmlFix(entry.description) + '</div>\n';
        }

        // Contribution title and PDF (if present)
        if (entry.cont_title) {
            html += '<div class="list-authors" style="font-weight:normal;font-size:100%;color:#6A994E;text-decoration:none;">';
            html += '<span style="font-style:normal;font-weight:bold;">Title:</span> <span style="font-style:italic;">' + htmlFix(entry.cont_title) + '</span>';
            if (entry.pdf_url) {
                html += ' <a href="' + entry.pdf_url + '" target="_blank" style="color:' + pdfcolor + ';text-decoration:none;">[PDF]</a>';
                if (entry.references) {
                    html += ' <a href="/' + entry.references + '" style="color:' + referencecolor + ';text-decoration:none;">[references]</a>';
                }
            } else if (entry.references) {
                html += ' <a href="/' + entry.references + '" style="color:' + referencecolor + ';text-decoration:none;">[references]</a>';
            }
            html += '</div>\n';
        } else if (entry.pdf_url) {
            // If no cont_title but PDF exists, show PDF link alone
            html += '<div class="list-pdf" style="font-weight:normal;font-size:100%;margin-top:0.2em;">';
            html += '<a href="' + entry.pdf_url + '" target="_blank" style="color:' + pdfcolor + ';text-decoration:none;">[PDF]</a>';
            if (entry.references) {
                html += ' <a href="/' + entry.references + '" style="color:' + referencecolor + ';text-decoration:none;">[references]</a>';
            }
            html += '</div>\n';
        } else if (entry.references) {
            // If only references exist
            html += '<div class="list-references" style="font-weight:normal;font-size:100%;margin-top:0.2em;">';
            html += '<a href="/' + entry.references + '" style="color:' + referencecolor + ';text-decoration:none;">[references]</a>';
            html += '</div>\n';
        }

        html += '</div>\n</dd>\n';
        return html;
    }

    // Render each category with section header if not empty, using a single counter
    categories.forEach(function(cat) {
        if (cat.entries.length) {
            html += '<div style="font-weight:bold; font-size:110%; margin-bottom:0.5em;">' + cat.name + ':</div>\n';
            cat.entries.forEach(function(entry) {
                html += renderTalk(entry, counter);
                counter--;
            });
        }
    });

    html += '</dl>\n</div>\n';
    // Only update the DOM after the data is loaded (like port_arXiv.js)
    document.getElementById('tablefeed').innerHTML = html;
}