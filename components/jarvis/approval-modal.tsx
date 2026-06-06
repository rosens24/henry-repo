"use client";

import { ShieldAlert, X } from "lucide-react";
import type { ActionResult } from "@/lib/actions/action-types";

type ApprovalModalProps = {
  action: ActionResult | null;
  onClose: () => void;
  onApprove: (action: ActionResult) => void;
};

export function ApprovalModal({ action, onClose, onApprove }: ApprovalModalProps) {
  if (!action) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4">
      <section className="glass-panel w-full max-w-md rounded-lg p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <ShieldAlert className="mt-1 size-5 text-amber-200" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100">Approval required</p>
              <h2 className="mt-2 text-xl font-semibold text-white">{action.actionName}</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close approval modal" className="text-slate-300 hover:text-white">
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-300">{action.summary}</p>
        <div className="mt-4 rounded-lg border border-amber-200/20 bg-amber-300/10 p-3 text-sm text-amber-50">
          Permission needed: {action.permissionRequired.join(" or ")}. This approves the operator handoff only. Real execution still needs a specific command target.
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onApprove(action)}
            className="rounded-lg border border-emerald-300/30 bg-emerald-300/15 px-4 py-2 text-sm font-semibold text-emerald-50"
          >
            Approve handoff
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-cyan-300/30 bg-cyan-300/15 px-4 py-2 text-sm font-semibold text-cyan-50"
          >
            Keep as recommendation
          </button>
        </div>
      </section>
    </div>
  );
}
