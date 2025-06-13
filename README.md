# academic-list
Snippets of code to automate scientific personal websites and CV lists.

## Usage
### arXiv port
Generates a list of arXiv papers, classified in preprints and published papers with a unique counter and prints them in chronological order with basic information.
Parameters:
- `js_src`: Path to the JavaScript source file containing the arXiv paper metadata. Can be a local file or a URL (https://arxiv.org/a/your_arxiv_id.js)
- `arxiv_includeTitle`.
- `arxiv_includeSummary`.
- `arxiv_includeJournalRef`.
- `arxiv_max_entries`: Maximum number of entries to include in the list.
- `boldname`: name that should be bolded in the list.
- `journalcolor, arxivcolor`: Colors for the journal and arXiv links.
- `listprefix`: Prefix for the list items.
- `separator_color`: Color for the separator line.
- `font_family`: Font family for the list items.

Check the example in `example_port_arXiv.html`. 

### Zotero port
Takes your Zotero public publication list (or any .bib) and generates a .bib file ready to use with `latex/publication_list.tex`, separated between preprints and published papers. It highlights your name in bold in the list and adds a * to the author in position `number` if there is a note `FTheory:number`, in the reference (I use this to indicate that I am the first theory author in a collaboration).

The reference format is similar to the APS standard.

Your public Zotero library can be accessed at `https://api.zotero.org/users/<user_id>/publications/items?format=bibtex`. Find your `<usrer_id>` at https://www.zotero.org/settings/security#applications.

Check the example in `example_port_Zotero.sh`.