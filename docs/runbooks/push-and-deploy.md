# Henry IV Push And Deploy Runbook

Repository:

```bash
C:\Users\Shalo\cleanzwebapp\jarvis-dashboard
```

GitHub remote:

```bash
https://github.com/rosens24/henry-repo.git
```

Production URL:

```bash
https://henryiv.up.railway.app
```

Default flow for final changes:

1. Work on branch `main` unless a separate feature branch is explicitly requested.
2. Check local state with `git status --short --branch`.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Commit with a short message describing the real change.
6. Push with `git push origin main`.
7. Verify Railway by checking `https://henryiv.up.railway.app/api/system/status`.

Voice deployment check:

```bash
curl https://henryiv.up.railway.app/api/system/status
```

The voice UI can pass browser mic and speaker tests while the AI provider is still blocked. Henry IV is fully live only when `aiConnected` is `true`.
