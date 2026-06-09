"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { defaultBusinessData, getCedarNeckDealGoal, getCleanzCrmGoal, parseListInput, type BusinessData } from "@/lib/business/business-data";

export function MobileCommandCenter() {
  const [draft, setDraft] = useState<BusinessData>(defaultBusinessData);
  const [saveState, setSaveState] = useState("Ready");
  const cleanzGoal = getCleanzCrmGoal(draft);
  const dealGoal = getCedarNeckDealGoal(draft);

  useEffect(() => {
    async function loadData() {
      const response = await fetch("/api/business-data");

      if (response.ok) {
        setDraft(await response.json() as BusinessData);
      }
    }

    void loadData();
  }, []);

  async function save() {
    setSaveState("Saving...");
    const response = await fetch("/api/business-data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });

    if (response.ok) {
      setDraft(await response.json() as BusinessData);
      setSaveState("Saved");
      return;
    }

    setSaveState("Save failed");
  }

  function addCompany() {
    const now = new Date().toISOString();
    setDraft((current) => ({
      ...current,
      cleanzCrm: [{
        id: crypto.randomUUID(),
        companyName: "",
        contactName: "",
        phone: "",
        email: "",
        website: "",
        status: "to_call",
        notes: "",
        nextStep: "Call and qualify cleaning needs.",
        createdAt: now,
        updatedAt: now,
      }, ...current.cleanzCrm],
    }));
  }

  function addDeal() {
    const now = new Date().toISOString();
    setDraft((current) => ({
      ...current,
      cedarNeckDeals: [{
        id: crypto.randomUUID(),
        propertyName: "",
        address: "",
        dealType: "single_family",
        source: "",
        status: "new",
        askingPrice: 0,
        units: 1,
        notes: "",
        nextStep: "Research owner, property condition, rent upside, and motivation.",
        createdAt: now,
        updatedAt: now,
      }, ...current.cedarNeckDeals],
    }));
  }

  return (
    <>
      <section className="glass-panel rounded-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-yellow-100">Monthly targets</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Momentum board</h2>
          </div>
          <button type="button" onClick={save} className="flex items-center gap-2 rounded-lg border border-yellow-300/25 bg-yellow-300/15 px-3 py-2 text-sm font-semibold text-yellow-50">
            <Save className="size-4" />
            Save
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          <MobileGoal title="Cleanz companies" completed={cleanzGoal.completed} goal={cleanzGoal.currentGoal} remaining={cleanzGoal.remaining} progress={cleanzGoal.progressPercent} />
          <MobileGoal title="Cedar Neck deals" completed={dealGoal.completed} goal={dealGoal.currentGoal} remaining={dealGoal.remaining} progress={dealGoal.progressPercent} />
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-zinc-400">{saveState}</p>
      </section>

      <section className="glass-panel rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Cleanz CRM</h2>
          <button type="button" onClick={addCompany} className="rounded-lg border border-yellow-300/25 bg-yellow-300/15 p-2 text-yellow-50" aria-label="Add company">
            <Plus className="size-4" />
          </button>
        </div>
        <div className="mt-3 grid gap-3">
          {draft.cleanzCrm.map((company) => (
            <article key={company.id} className="rounded-lg border border-yellow-300/15 bg-black/40 p-3">
              <MobileInput label="Company" value={company.companyName} onChange={(companyName) => setDraft((current) => ({ ...current, cleanzCrm: current.cleanzCrm.map((item) => item.id === company.id ? { ...item, companyName } : item) }))} />
              <MobileInput label="Phone" value={company.phone} onChange={(phone) => setDraft((current) => ({ ...current, cleanzCrm: current.cleanzCrm.map((item) => item.id === company.id ? { ...item, phone } : item) }))} />
              <MobileTextarea label="Notes / next step" value={`${company.notes}\n${company.nextStep}`.trim()} onChange={(value) => setDraft((current) => ({ ...current, cleanzCrm: current.cleanzCrm.map((item) => item.id === company.id ? { ...item, notes: value } : item) }))} />
              <button type="button" onClick={() => setDraft((current) => ({ ...current, cleanzCrm: current.cleanzCrm.filter((item) => item.id !== company.id) }))} className="mt-2 flex items-center gap-2 text-xs text-red-100">
                <Trash2 className="size-3" />
                Remove
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Cedar Neck Deals</h2>
          <button type="button" onClick={addDeal} className="rounded-lg border border-yellow-300/25 bg-yellow-300/15 p-2 text-yellow-50" aria-label="Add deal">
            <Plus className="size-4" />
          </button>
        </div>
        <div className="mt-3 grid gap-3">
          {draft.cedarNeckDeals.map((deal) => (
            <article key={deal.id} className="rounded-lg border border-yellow-300/15 bg-black/40 p-3">
              <MobileInput label="Property" value={deal.propertyName} onChange={(propertyName) => setDraft((current) => ({ ...current, cedarNeckDeals: current.cedarNeckDeals.map((item) => item.id === deal.id ? { ...item, propertyName } : item) }))} />
              <MobileInput label="Address" value={deal.address} onChange={(address) => setDraft((current) => ({ ...current, cedarNeckDeals: current.cedarNeckDeals.map((item) => item.id === deal.id ? { ...item, address } : item) }))} />
              <MobileTextarea label="Notes / next step" value={`${deal.notes}\n${deal.nextStep}`.trim()} onChange={(value) => setDraft((current) => ({ ...current, cedarNeckDeals: current.cedarNeckDeals.map((item) => item.id === deal.id ? { ...item, notes: value } : item) }))} />
              <button type="button" onClick={() => setDraft((current) => ({ ...current, cedarNeckDeals: current.cedarNeckDeals.filter((item) => item.id !== deal.id) }))} className="mt-2 flex items-center gap-2 text-xs text-red-100">
                <Trash2 className="size-3" />
                Remove
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white">Health OS</h2>
        <div className="mt-3 grid gap-3">
          <MobileTextarea label="Food" value={draft.healthOs.food.join("\n")} onChange={(value) => setDraft((current) => ({ ...current, healthOs: { ...current.healthOs, food: parseListInput(value) } }))} />
          <MobileTextarea label="Mind" value={draft.healthOs.mind.join("\n")} onChange={(value) => setDraft((current) => ({ ...current, healthOs: { ...current.healthOs, mind: parseListInput(value) } }))} />
          <MobileTextarea label="Body" value={draft.healthOs.body.join("\n")} onChange={(value) => setDraft((current) => ({ ...current, healthOs: { ...current.healthOs, body: parseListInput(value) } }))} />
          <MobileTextarea label="Exercise" value={draft.healthOs.exercise.join("\n")} onChange={(value) => setDraft((current) => ({ ...current, healthOs: { ...current.healthOs, exercise: parseListInput(value) } }))} />
        </div>
      </section>
    </>
  );
}

function MobileGoal({ title, completed, goal, remaining, progress }: { title: string; completed: number; goal: number; remaining: number; progress: number }) {
  return (
    <div className="rounded-lg border border-yellow-300/15 bg-black/35 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-sm text-yellow-100">{completed}/{goal}</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full bg-yellow-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-xs text-zinc-400">{remaining} left before the target steps up.</p>
    </div>
  );
}

function MobileInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mt-2 grid gap-1 text-sm text-zinc-300">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-yellow-300/20 bg-black/55 px-3 py-2 text-white outline-none" />
    </label>
  );
}

function MobileTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mt-2 grid gap-1 text-sm text-zinc-300">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-24 rounded-lg border border-yellow-300/20 bg-black/55 px-3 py-2 text-white outline-none" />
    </label>
  );
}
