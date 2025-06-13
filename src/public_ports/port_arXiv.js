// Based on https://arxiv.org/help/myarticles
function manageDefaults() {
    if (typeof arxiv_includeTitle === 'undefined') {
        arxiv_includeTitle = 1; }
    if (typeof arxiv_includeSummary === 'undefined') {
        arxiv_includeSummary = 0; }
    if (typeof arxiv_includeJournalRef === 'undefined') {
        arxiv_includeJournalRef = 1; }
    if (typeof arxiv_max_entries === 'undefined') {
        arxiv_max_entries = 10;	}
    if (typeof boldname === 'undefined') {
            boldname = 0;}
    if (typeof journalcolor === 'undefined') {
        journalcolor = '#6A994E'; }
    if (typeof arxivcolor === 'undefined') {
        arxivcolor = '#BC4749'; }
    if (typeof listprefix === 'undefined') {
        listprefix = ''; }
    if (typeof separator_color === 'undefined') {
        separator_color = '#F2F2F3';}
    if (typeof font_family === 'undefined') {
        font_family = 'Lucida Grande,helvetica, arial, verdana,sans-serif';}
    return 1;	
}

// IE doesn't like &apos; which we have in JSON data, so change to numeric entity
function htmlFix(html) {
      var re = new RegExp('&apos;', 'g');
    html = html.replace(re,'&#39;');
    return html;
}

// This function will be called by js/publications.js (JSONP style)
function jsonarXivFeed(feed) {
    manageDefaults();
    makearXiv(feed);
}

// Dynamically load js/publications.js as a script
(function() {
    if (typeof js_src === 'undefined' || !js_src) {
        throw new Error('You must define a js_src variable with the path or URL to your publications.js file.');
    }
    var headID = document.getElementsByTagName("head")[0];
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.src = js_src; 
    headID.appendChild(newScript);
})();

function makearXiv(feed) {
    var x = 0;
    var html = '<div id="arxivcontainer" style="font-family:' + font_family + ';margin:.7em;font-size:90%">\n';
    html += '<dl style="margin:0;">\n';

    // Determine number of entries to show
    var num_entries, extra_entries;
    if (arxiv_max_entries === 0) {
        num_entries = feed.entries.length;
        extra_entries = false;
    }
    else if (arxiv_max_entries >= feed.entries.length) {
        num_entries = feed.entries.length;
        extra_entries = false;
    }
    else {
        num_entries = arxiv_max_entries;
        extra_entries = true;
    }

    // Separate entries with and without journal_ref
    var entriesWithJournalRef = [];
    var entriesWithoutJournalRef = [];
    for (x = 0; x < num_entries; x++) {
        if (feed.entries[x].journal_ref && feed.entries[x].journal_ref.length > 1) {
            entriesWithJournalRef.push(feed.entries[x]);
        } else {
            entriesWithoutJournalRef.push(feed.entries[x]);
        }
    }

    // Helper function to render an entry, given the entry and its display index
    function renderEntry(entry, displayIndex) {
        var html = '';
        html += '<dt style="display:flex;align-items:flex-start;margin-bottom:0.25em;">';
        html += '<span style="display:inline-block;min-width:3.5em;text-align:right;font-family:monospace;">[' + listprefix + displayIndex + ']</span>';
        html += '<span class="list-identifier" style="font-size:large;font-weight:bold;margin-left:0.5em;line-height:120%">';
        if (entry.journal_ref && entry.journal_ref.length > 1 && entry.doi && entry.doi.length > 0) {
            html += '<a href="https://dx.doi.org/' + entry.doi + '" title="Journal" style="text-decoration:none;color:inherit;">' + entry.title + '</a>';
        } else {
            html += '<a href="' + entry.id + '" title="Preprint" style="text-decoration:none;color:inherit;">' + entry.title + '</a>';
        }
        html += "</span>\n</dt>\n";
        html += '<dd style="margin:0 0 1em 0; padding:0 0 0 4.2em;">\n<div class="meta" style="line-height:130%;">\n';

        // Authors
        var authorsList = entry.authors.split(',').map(function(name) { return name.trim(); });
        var authorsHtml = authorsList.map(function(name) {
            if (boldname && name === boldname) {
                return '<b>' + boldname + '</b>';
            } else if (name.length > 0) {
                var encodedName = encodeURIComponent(name);
                return '<a href="https://arxiv.org/search/?query=' + encodedName + '&searchtype=author" target="_blank" title="Author\'s arXiv" style="text-decoration:none;color:inherit;font-weight:normal;">' + name + '</a>';
            } else {
                return '';
            }
        }).join(', ');
        html += '<div class="list-authors" style="font-weight:normal;font-size:100%;text-decoration:none;">' + authorsHtml + '</div>\n';

        // Journal ref
        if (arxiv_includeJournalRef && entry.journal_ref && entry.journal_ref.length > 1) {
            html += '<div class="list-journal-ref" style="font-weight:normal;font-size:100%;color:' + journalcolor + ';text-decoration:none;">';
            if (entry.doi && entry.doi.length > 0) {
                html += '<a href="https://dx.doi.org/' + entry.doi + '" title="Journal" style="color:' + journalcolor + ';text-decoration:none;">' + entry.journal_ref + '</a>';
            } else {
                html += entry.journal_ref;
            }
            html += '</div>\n';
        }


        // arXiv id and year
        var absMatch = entry.id.match(/arxiv\.org\/abs\/([^\/\?#]+)/i);
        if (absMatch && absMatch[1]) {
            absMatch[1] = absMatch[1].replace(/v\d+$/, '');
        }
        if (absMatch && absMatch[1]) {
            var year = '';
            if (entry.updated) {
                var match = entry.updated.match(/^(\d{4})/);
                if (match) {
                    year = match[1];
                }
            }
             html += '<div class="list-arxiv-id" style="font-weight:normal;font-size:100%;">' +
                '<a href="' + entry.id + '" title="Preprint" style="text-decoration:none;color:' + arxivcolor + ';">arXiv:' + absMatch[1] + (year ? ' (' + year + ')' : '') + '</a></div>\n';
        }

        // Summary (if enabled)
        if (arxiv_includeSummary != 0) {
            html += '<p>' + entry.summary + '</p>\n';
        }
        html += '</div>\n</dd>';
        return html;
    }

    // Prepritns first
    html += '<div style="font-weight:bold; font-size:110%; margin-bottom:0.5em;">Preprints:</div>\n';
    for (x = 0; x < entriesWithoutJournalRef.length; x++) {
        html += renderEntry(entriesWithoutJournalRef[x], num_entries - x);
    }
    html += '<hr style="border:0; border-top:2px solid ' + separator_color + '; margin:1em 0;">\n';

    // Published journals second
    html += '<div style="font-weight:bold; font-size:110%; margin-top:1em; margin-bottom:0.5em;">Journals:</div>\n';
    for (var y = 0; y < entriesWithJournalRef.length; y++) {
        html += renderEntry(entriesWithJournalRef[y], num_entries - (entriesWithoutJournalRef.length + y));
    }
    html += '</dl>\n</div>\n';
    document.getElementById('arxivfeed').innerHTML = html;
}