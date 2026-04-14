# PR Review Gate

- [ ] No blocking-severity findings
- [ ] All new files have appropriate TypeScript types
- [ ] No secrets introduced
- [ ] Tests exist for new utility functions (warn if missing, not block)
- [ ] No new `any` types
- [ ] No `console.log` left in production paths
- [ ] New pages preserve the shared metadata contract via `Layout` and `Meta`
- [ ] New API routes have auth or secret checks if they modify data or enable privileged behavior
- [ ] Impacted files have been checked and show no regressions
