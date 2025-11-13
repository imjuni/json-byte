# JSON byte change log

----

## Version 1.1.0

Released on November 14, 2025

----

- Improved search functionality
  - Highlight all matching nodes when multiple search results are found
  - Navigate to the found node when only a single search result exists
- Fixed editor language detection issue
  - Editor language setting now properly updates when content in a different language is entered

## Version 1.0.1

Released on October 22, 2025

----

- Fixed incorrect node range selection in the editor when clicking nodes
  - Rewrote node building logic using built-in parsers from jsonc-parser and yaml
  - Added node range information to the store during node creation

## Version 1.0.0

Released on October 14, 2025

----

- Initial version released
