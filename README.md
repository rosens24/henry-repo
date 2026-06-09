# Henry IV Dashboard

## Voice and Codex Feed

Henry IV has two voice paths:

- Live Realtime voice uses `OPENAI_REALTIME_MODEL`, `OPENAI_REALTIME_VOICE=cedar`, and server-side `OPENAI_API_KEY`.
- Browser fallback voice uses local speech recognition, sends the transcript to `/api/jarvis`, and speaks the answer with browser TTS.

Stored Henry IV turns are available for Codex at:

```bash
curl http://localhost:3000/api/codex/feed
```

On Railway, set `DATABASE_URL` to persist the feed in Postgres. Without `DATABASE_URL`, local dev stores it in `data/henry-conversation-feed.json`.
