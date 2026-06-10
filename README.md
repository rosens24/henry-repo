# Henry IV Dashboard

## Voice and Codex Feed

Henry IV has two voice paths:

- Browser voice uses local speech recognition, sends the transcript to `/api/jarvis`, uses Grok when `XAI_API_KEY` is configured, and speaks the answer with browser TTS.
- Gemini remains available as a backup provider when `GEMINI_API_KEY` is configured.
- OpenAI Live Realtime voice uses `OPENAI_REALTIME_MODEL`, `OPENAI_REALTIME_VOICE=cedar`, and server-side `OPENAI_API_KEY`; it requires OpenAI API quota.

Stored Henry IV turns are available for Codex at:

```bash
curl http://localhost:3000/api/codex/feed
```

On Railway, set `DATABASE_URL` to persist the feed in Postgres. Without `DATABASE_URL`, local dev stores it in `data/henry-conversation-feed.json`.

## Testing

Use the Voice + Settings screen to run the AI Provider status check and the live Henry IV agent test.

The same checks are available through:

```bash
curl https://henryiv.up.railway.app/api/system/status
curl https://henryiv.up.railway.app/api/codex/feed
```
