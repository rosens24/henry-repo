# Henry IV Voice Diagnostics Runbook

Browser speech recognition depends on browser support and network access to the browser speech service.

If Henry IV is not hearing commands:

1. Use Chrome or Edge on `localhost`.
2. Click `Check mic` in the Voice panel.
3. Allow microphone access in the browser address bar.
4. If STT shows degraded, use the typed voice fallback.
5. Click `Sound beep` to verify browser/system audio.
6. Click `API reply` to verify Henry IV backend response.

TTS can work even when browser STT fails. Real OpenAI speech-to-speech is not connected yet.
