# Henry IV Voice Diagnostics Runbook

Browser speech recognition depends on browser support and network access to the browser speech service.

If Henry IV is not hearing commands:

1. Use Chrome, Edge, or Brave on the deployed HTTPS site. For local development, use Chrome or Edge on `localhost`.
2. Click `Check mic` in the Voice panel.
3. Allow microphone access in the browser address bar.
4. If STT shows blocked or degraded, use the typed voice fallback.
5. Click `Sound beep` to verify browser/system audio.
6. Click `Test voice reply` to verify browser speech output.
7. Click `API reply` to verify the Henry IV backend and the real AI provider.

Voice has three separate parts:

- Mic/STT: browser speech recognition hears your command.
- AI provider: Henry IV sends the command to the configured live provider.
- TTS: browser speech synthesis reads the answer out loud.

TTS can work even when browser STT fails. Browser STT can work even when the AI provider is blocked. If the AI Provider panel says Grok/xAI is blocked with a `403`, the xAI team needs credits/licenses before Henry IV can answer through Grok.

Real OpenAI speech-to-speech is separate from browser voice and requires OpenAI API quota.
