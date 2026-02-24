# Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

## Format

```
<type>(<scope>): <short summary>
```

## Types

| Type       | Description                                          |
| ---------- | ---------------------------------------------------- |
| `feat`     | A new feature                                        |
| `fix`      | A bug fix                                            |
| `docs`     | Documentation changes only                           |
| `style`    | Formatting, missing semicolons — no code change      |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                              |
| `test`     | Adding or correcting tests                           |
| `build`    | Changes to build system or external dependencies     |
| `ci`       | CI configuration changes                             |
| `chore`    | Other changes that don't modify `src` or `test`      |
| `revert`   | Reverts a previous commit                            |

## Scopes

Use the folder/feature area, e.g. `web`, `server`, `prisma`, `auth`, `events`, `artists`, `chat`.

## Examples

```
feat(web): add artist search filters
fix(server): handle duplicate email on registration
docs: update ARCHITECTURE.md with Phase 2 changes
refactor(web): migrate auth to NextAuth
chore: update dependencies
```

## Breaking Changes

Append `!` after the type/scope or add a `BREAKING CHANGE:` footer:

```
feat(auth)!: replace JWT with NextAuth sessions
```
