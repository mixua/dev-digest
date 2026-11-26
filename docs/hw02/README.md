# HW02 part B: API Contract Reviewer

## Files
- `agents/api-contract-reviewer.md` - system prompt for the "API Contract Reviewer" agent (severity CRITICAL / WARNING / SUGGESTION; the homework's INFO maps to SUGGESTION).
- `skills/breaking-change.md` - removal/change of a public contract without a migration path.
- `skills/response-schema.md` - response shape changes and client consumers.
- `skills/semver-discipline.md` - when a change needs a major / minor / patch bump.
- `skills/deprecation-policy.md` - Deprecation/Sunset headers, OpenAPI `deprecated`, logging, transition period.

## How to load the skills
- Create via UI (Skills -> New, type `security`): `breaking-change`, `response-schema`, `semver-discipline`.
- Create via **import**: `deprecation-policy` (Skills -> Import .md). The importer reads the YAML frontmatter (`name`, `description`, `type: security`) and stores the body without it; the preview shows them before saving.
- Link all four to the API Contract Reviewer agent and keep them enabled.

## PR description: experiment table
| Run | CRITICAL | WARNING | SUGGESTION | Key findings |
|---|---|---|---|---|
| Without skills | | | | |
| With skills | | | | |
