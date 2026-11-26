---
name: semver-discipline
description: Use when a PR changes a public API or its version (package.json version, /v1 prefix, OpenAPI info.version, changelog) and you must judge whether it needs a major, minor or patch bump. Report a breaking change shipped without a major bump (or new version prefix) as CRITICAL, an under- or over-stated bump as WARNING. Do NOT apply to private/internal packages, docs-only changes, or when no versioned public API is touched.
type: security
---

# semver-discipline

## When to apply
The diff changes a public contract or a version marker, or ships a contract change with no version marker at all.

## Rules
1. MAJOR: any breaking change (removed/renamed route, field, param; type change; new required input).
2. MINOR: backward-compatible addition (new route, new optional field/param).
3. PATCH: bug fix with an unchanged contract.
4. Breaking change without a major bump or a new URL version prefix (`/v2`) => CRITICAL.
5. A compatible change labelled major, or a breaking one labelled minor/patch => WARNING.
6. At `0.x`: breaking changes still need a documented note; recommend a minor bump.
7. In the suggested fix, mention the expected changelog / migration-note entry.

## Good / Bad
Bad - breaking removal, version unchanged:
```diff
-router.get('/api/blog/comments/:id', listComments);
 // package.json: "version": "1.4.2"  (unchanged)
```
Good - new prefix or major bump, old version still served:
```js
app.use('/api/v2', v2Router);   // new contract
app.use('/api', v1Router);      // old contract kept until Sunset
// package.json: "version": "2.0.0"
```

## Limits
- Do not demand a bump for internal packages or apps with no external consumers.
- Do not invent a versioning scheme the repo does not use; follow what the diff shows.
- Leave removal mechanics to breaking-change and deprecation-policy.
