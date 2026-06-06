export type XenomorphHandoff = {
  id: string;
  prompt: string;
  status: "queued";
  dataLabel: "local handoff";
  createdAt: string;
};

const handoffQueue: XenomorphHandoff[] = [];

export function queueXenomorphHandoff(prompt: string) {
  const handoff: XenomorphHandoff = {
    id: crypto.randomUUID(),
    prompt,
    status: "queued",
    dataLabel: "local handoff",
    createdAt: new Date().toISOString(),
  };

  handoffQueue.unshift(handoff);
  handoffQueue.splice(20);

  return handoff;
}

export function getXenomorphHandoffs() {
  return [...handoffQueue];
}
