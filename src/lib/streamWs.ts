/** Stream chat: `{wsBase}/scws/{streamId}` — `streamId` = `/streams/create` (yoki if-exist) javobidagi `id`. */
export function buildStreamWsUrl(wsBase: string, streamId: string): string {
  return `${wsBase.replace(/\/$/, "")}/scws/${streamId}`;
}
