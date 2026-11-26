---
name: response-schema
description: Use when a PR changes the shape of an API response or the client code reading it: renamed/removed fields, changed types, optional to required or reverse, new nullability, changed envelope, pagination or error format. Report when a consumer in the diff or a public client would read undefined or a wrong type. Do NOT apply to adding a new optional field, internal DTO refactors, or purely request-side changes.
type: security
---

# response-schema

## When to apply
The diff touches what a handler returns (`res.json(...)`) or what a client reads from it.

## Rules
1. Removed or renamed field => breaking (CRITICAL if a consumer reads it).
2. Type change (`string` -> `number`, scalar -> object, array -> paginated envelope) => breaking.
3. Optional -> required in a response is safe; required -> optional/nullable is breaking for consumers.
4. Adding a new optional field is non-breaking; do not report it (at most SUGGESTION to document it).
5. Cross-check both sides: handler shape vs. client reads (`data.comments`, `res.data.content`) in the same diff. A mismatch between sides (e.g. client sends `comment`, server expects `content`) is a finding.
6. A changed error body or status code counts as response shape.

## Good / Bad
Bad - field renamed on the server, client still reads the old name:
```js
-res.json({ success: true, comments });
+res.json({ success: true, data: { items: comments } });
// client/src/api/commentApi.js still: const { comments } = res.data;
```
Good - old field kept alongside the new one for a transition period:
```js
res.json({ success: true, comments, data: { items: comments } }); // comments: deprecated
```

## Limits
- Compare only shapes visible in the diff or its direct consumers; do not guess hidden schemas.
- Does not decide the version bump (semver-discipline) or the deprecation mechanics (deprecation-policy).
- Reordering JSON keys or changing whitespace is not a schema change.
