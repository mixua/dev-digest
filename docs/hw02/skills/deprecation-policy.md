---
name: deprecation-policy
description: Use when a PR removes or replaces a public route, field or client method, or marks one deprecated, and must follow a deprecation process instead of silent removal: Deprecation and Sunset headers, Link to the successor, OpenAPI deprecated true, usage logging, and a transition period. Report silent removal as CRITICAL and an incomplete deprecation as WARNING. Do NOT apply to internal code, brand-new endpoints, or contracts already past a published Sunset date.
type: security
---

# deprecation-policy

## When to apply
An old contract element is being phased out, or the diff should be phasing it out instead of deleting it.

## Rules
1. Do not delete in one step: keep the old element working for a transition period.
2. Old route responses carry `Deprecation: true` (or a date) and `Sunset: <HTTP-date>`,
   plus `Link: <new-path>; rel="successor-version"`.
3. Mark the element `deprecated: true` in the OpenAPI spec / docs and name the replacement.
4. Log each call to a deprecated element (route, client id) so removal can be decided on data.
5. State the transition period (e.g. at least one minor release or 90 days) and the removal version.
6. Silent removal => CRITICAL. Deprecated but missing headers/docs/replacement => WARNING. Missing log => SUGGESTION.

## Good / Bad
Bad - route silently deleted:
```diff
-blogRouter.post('/add-comment', auth, addComment);
```
Good - deprecated alias with headers and logging:
```js
const deprecated = (successor, sunset) => (req, res, next) => {
  res.set('Deprecation', 'true');
  res.set('Sunset', sunset);
  res.set('Link', `<${successor}>; rel="successor-version"`);
  logger.warn({ route: req.path }, 'deprecated route called');
  next();
};
blogRouter.post('/add-comment', auth, deprecated('/api/comment/add', 'Wed, 31 Mar 2027 00:00:00 GMT'), addComment);
```

## Limits
- Does not choose the version number (semver-discipline) or analyse field shapes (response-schema).
- Do not require a transition period for endpoints never released publicly.
- If a Sunset date in the diff has already passed, removal is allowed; do not report it.
