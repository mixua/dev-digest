---
name: breaking-change
description: Use when a PR removes, renames, moves or changes a public contract (HTTP route, method, path/query param, request or response field, exported client function) with no migration path: no redirect, no deprecated alias, no version bump. Report each as CRITICAL with the removed element, who breaks and a fix. Do NOT apply to purely internal code, additive optional fields, or refactors that keep the contract identical.
type: security
---

# breaking-change

## When to apply
Any diff line that deletes or alters something an external caller can reach: a route
registration, HTTP method, URL path, param, field, or an exported client function.

## Rules
1. Treat removal, rename, move, method change and a new required param as BREAKING.
2. Find the callers: server routes -> frontend API modules, hooks, pages, other services.
   A route removed while a client in the repo still calls it is CRITICAL.
3. A breaking change is acceptable only with a migration path: redirect (301/308),
   deprecated alias for the old route, or a new major version/prefix.
4. No migration path => CRITICAL. A path exists but is incomplete (no headers, no docs) => WARNING.
5. Report one finding per removed/changed element; do not merge unrelated routes into one.
6. Always give: title, severity, file:lines, explanation, who breaks, suggested fix.

## Good / Bad
Bad (`server/src/routes/blogRoutes.js`) - old comment routes deleted, new path only:
```js
-blogRouter.post('/add-comment', auth, addComment);
-blogRouter.post('/comments', getBlogComments);
+commentRouter.post('/api/comment/add', auth, addComment);
```
Good - old routes kept as deprecated aliases (or redirected) while clients migrate:
```js
commentRouter.post('/api/comment/add', auth, addComment);
blogRouter.post('/add-comment', auth, deprecated('/api/comment/add'), addComment); // alias
```

## Limits
- Does not judge response-field changes in detail (see response-schema), version
  numbers (see semver-discipline) or header mechanics (see deprecation-policy).
- Ignore internal helpers, private modules and renamed local variables.
- Do not report speculative callers; cite a real caller in the diff or state who plausibly depends on a public route.
