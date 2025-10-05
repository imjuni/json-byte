# json-byte

---

## Project Overview

json 데이터 형식을 읽어 보기 좋게 visualize 하는 사이트

## Commit

### Commit Log

- Use Conventional Commit format
- First line must not exceed 50 characters
- All commit messages must be written in English
- Include comprehensive description of changes in commit body

### Example Commit

```text
feat(dedupe): add request deduplication system

- Add @Dedupe decorator for method-level request deduplication
- Implement RequestDedupeManager with wrapper-based result tracking
- Add cacheKeyExclude and cacheKeyExcludePaths options for cache control
- Refactor field option processors into modular structure
- Add comprehensive test coverage for new features
- Create utility functions for cache key generation and JSON handling

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```
