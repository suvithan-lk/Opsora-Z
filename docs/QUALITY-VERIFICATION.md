# Quality Verification

Before merging changes into `main`, run:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

GitHub Actions runs the same checks for `main`, `fix/**`, and `feature/**` branches. A pull request should be merged only after the workflow completes successfully.
