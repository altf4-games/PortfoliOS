"use client";

import { useEffect, useState } from "react";
import type { SiteData } from "@/lib/types";
import { logoutAction } from "@/app/admin/actions";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-md bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none focus:border-cyan-400";

export default function AdminDashboard({ userLogin }: { userLogin: string }) {
  const [data, setData] = useState<SiteData | null>(null);
  const [kvConfigured, setKvConfigured] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  // Kept separate from data.projectOverrides.included so the field can hold a comma the
  // user just typed, mid-edit, without it being immediately stripped by the trim/filter
  // pass — the input's displayed value must be the raw text, not the reprocessed array.
  const [includedText, setIncludedText] = useState("");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((body) => {
        setData(body.data);
        setKvConfigured(body.kvConfigured);
        setIncludedText(body.data.projectOverrides.included.join(", "));
      });
  }, []);

  async function save() {
    if (!data) return;
    setStatus("saving");
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } else {
      const body = await res.json().catch(() => ({}));
      setErrorMsg(body.error ?? "Failed to save.");
      setStatus("error");
    }
  }

  if (!data) {
    return <main className="min-h-dvh flex items-center justify-center bg-[#0a0a0c] text-white/60 text-sm">Loading...</main>;
  }

  return (
    <main className="min-h-dvh bg-[#0a0a0c] text-white p-6 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono">PortfoliOS Admin</h1>
          <p className="text-xs text-white/40">Signed in as @{userLogin}</p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-xs text-white/50 hover:text-white underline">
            Log out
          </button>
        </form>
      </div>

      {!kvConfigured && (
        <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-md p-3">
          KV is not configured (KV_REST_API_URL / KV_REST_API_TOKEN). Saving will fail until it&apos;s set in your
          environment.
        </p>
      )}

      {/* Resume */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-cyan-300">Resume</h2>
        <Field label="Resume URL">
          <input
            className={inputClass}
            value={data.profile.resumeUrl}
            onChange={(e) => setData({ ...data, profile: { ...data.profile, resumeUrl: e.target.value } })}
          />
        </Field>
      </section>

      {/* Profile */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-cyan-300">Profile</h2>
        <Field label="About">
          <textarea
            className={inputClass}
            rows={2}
            value={data.profile.about}
            onChange={(e) => setData({ ...data, profile: { ...data.profile, about: e.target.value } })}
          />
        </Field>
        <Field label="Whoami">
          <textarea
            className={inputClass}
            rows={2}
            value={data.profile.whoami}
            onChange={(e) => setData({ ...data, profile: { ...data.profile, whoami: e.target.value } })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="GitHub username">
            <input
              className={inputClass}
              value={data.profile.githubUsername}
              onChange={(e) => setData({ ...data, profile: { ...data.profile, githubUsername: e.target.value } })}
            />
          </Field>
          <Field label="LinkedIn URL">
            <input
              className={inputClass}
              value={data.profile.linkedinUrl}
              onChange={(e) => setData({ ...data, profile: { ...data.profile, linkedinUrl: e.target.value } })}
            />
          </Field>
          <Field label="Itch.io URL">
            <input
              className={inputClass}
              value={data.profile.itchUrl}
              onChange={(e) => setData({ ...data, profile: { ...data.profile, itchUrl: e.target.value } })}
            />
          </Field>
          <Field label="Steam URL">
            <input
              className={inputClass}
              value={data.profile.steamUrl}
              onChange={(e) => setData({ ...data, profile: { ...data.profile, steamUrl: e.target.value } })}
            />
          </Field>
          <Field label="Terminal hostname">
            <input
              className={inputClass}
              value={data.profile.hostname}
              onChange={(e) => setData({ ...data, profile: { ...data.profile, hostname: e.target.value } })}
            />
          </Field>
        </div>
      </section>

      {/* Education */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-cyan-300">Education</h2>
          <button
            className="text-xs text-cyan-300 hover:text-cyan-200"
            onClick={() =>
              setData({
                ...data,
                education: [
                  ...data.education,
                  { id: crypto.randomUUID(), degree: "", institution: "", period: "", detail: "" },
                ],
              })
            }
          >
            + Add
          </button>
        </div>
        <div className="space-y-3">
          {data.education.map((edu, i) => (
            <div key={edu.id} className="space-y-2 bg-white/5 rounded-md p-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputClass}
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => {
                    const next = [...data.education];
                    next[i] = { ...edu, degree: e.target.value };
                    setData({ ...data, education: next });
                  }}
                />
                <input
                  className={inputClass}
                  placeholder="Institution"
                  value={edu.institution}
                  onChange={(e) => {
                    const next = [...data.education];
                    next[i] = { ...edu, institution: e.target.value };
                    setData({ ...data, education: next });
                  }}
                />
              </div>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  className={inputClass}
                  placeholder="Period (e.g. Expected Graduation: 2027)"
                  value={edu.period}
                  onChange={(e) => {
                    const next = [...data.education];
                    next[i] = { ...edu, period: e.target.value };
                    setData({ ...data, education: next });
                  }}
                />
                <input
                  className={inputClass}
                  placeholder="Detail (e.g. CGPA: 9.5)"
                  value={edu.detail ?? ""}
                  onChange={(e) => {
                    const next = [...data.education];
                    next[i] = { ...edu, detail: e.target.value };
                    setData({ ...data, education: next });
                  }}
                />
                <button
                  className="text-red-400 hover:text-red-300 text-xs px-2"
                  onClick={() => setData({ ...data, education: data.education.filter((_, idx) => idx !== i) })}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-cyan-300">Work Experience</h2>
          <button
            className="text-xs text-cyan-300 hover:text-cyan-200"
            onClick={() =>
              setData({
                ...data,
                experience: [...data.experience, { id: crypto.randomUUID(), role: "", org: "", period: "" }],
              })
            }
          >
            + Add
          </button>
        </div>
        <div className="space-y-3">
          {data.experience.map((exp, i) => (
            <div key={exp.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-start bg-white/5 rounded-md p-2">
              <input
                className={inputClass}
                placeholder="Role"
                value={exp.role}
                onChange={(e) => {
                  const next = [...data.experience];
                  next[i] = { ...exp, role: e.target.value };
                  setData({ ...data, experience: next });
                }}
              />
              <input
                className={inputClass}
                placeholder="Organization"
                value={exp.org}
                onChange={(e) => {
                  const next = [...data.experience];
                  next[i] = { ...exp, org: e.target.value };
                  setData({ ...data, experience: next });
                }}
              />
              <input
                className={inputClass}
                placeholder="Period"
                value={exp.period}
                onChange={(e) => {
                  const next = [...data.experience];
                  next[i] = { ...exp, period: e.target.value };
                  setData({ ...data, experience: next });
                }}
              />
              <button
                className="text-red-400 hover:text-red-300 text-xs px-2 py-2"
                onClick={() => setData({ ...data, experience: data.experience.filter((_, idx) => idx !== i) })}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-cyan-300">Tech Stack</h2>
          <button
            className="text-xs text-cyan-300 hover:text-cyan-200"
            onClick={() => setData({ ...data, techStack: { ...data.techStack, "New Category": "" } })}
          >
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {Object.entries(data.techStack).map(([category, value], i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
              <input
                className={inputClass}
                placeholder="Category"
                value={category}
                onChange={(e) => {
                  const entries = Object.entries(data.techStack);
                  entries[i] = [e.target.value, value];
                  setData({ ...data, techStack: Object.fromEntries(entries) });
                }}
              />
              <input
                className={inputClass}
                placeholder="Comma-separated technologies"
                value={value}
                onChange={(e) => {
                  const entries = Object.entries(data.techStack);
                  entries[i] = [category, e.target.value];
                  setData({ ...data, techStack: Object.fromEntries(entries) });
                }}
              />
              <button
                className="text-red-400 hover:text-red-300 text-xs px-2"
                onClick={() => {
                  const entries = Object.entries(data.techStack).filter((_, idx) => idx !== i);
                  setData({ ...data, techStack: Object.fromEntries(entries) });
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Hackathons */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-cyan-300">Hackathon Wins</h2>
          <button
            className="text-xs text-cyan-300 hover:text-cyan-200"
            onClick={() =>
              setData({
                ...data,
                hackathons: [
                  ...data.hackathons,
                  { id: crypto.randomUUID(), title: "", result: "", date: "", url: "" },
                ],
              })
            }
          >
            + Add
          </button>
        </div>
        <div className="space-y-3">
          {data.hackathons.map((h, i) => (
            <div key={h.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-start bg-white/5 rounded-md p-2">
              <input
                className={inputClass}
                placeholder="Title"
                value={h.title}
                onChange={(e) => {
                  const next = [...data.hackathons];
                  next[i] = { ...h, title: e.target.value };
                  setData({ ...data, hackathons: next });
                }}
              />
              <input
                className={inputClass}
                placeholder="Result (e.g. Won 1st)"
                value={h.result}
                onChange={(e) => {
                  const next = [...data.hackathons];
                  next[i] = { ...h, result: e.target.value };
                  setData({ ...data, hackathons: next });
                }}
              />
              <input
                className={`${inputClass} w-24`}
                placeholder="Date"
                value={h.date}
                onChange={(e) => {
                  const next = [...data.hackathons];
                  next[i] = { ...h, date: e.target.value };
                  setData({ ...data, hackathons: next });
                }}
              />
              <button
                className="text-red-400 hover:text-red-300 text-xs px-2 py-2"
                onClick={() => setData({ ...data, hackathons: data.hackathons.filter((_, idx) => idx !== i) })}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-cyan-300">Achievements</h2>
        <Field label="One per line">
          <textarea
            className={inputClass}
            rows={5}
            value={data.achievements.join("\n")}
            onChange={(e) => setData({ ...data, achievements: e.target.value.split("\n") })}
          />
        </Field>
      </section>

      {/* Skills */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-cyan-300">Skills</h2>
        <Field label="One per line">
          <textarea
            className={inputClass}
            rows={4}
            value={data.skills.join("\n")}
            onChange={(e) => setData({ ...data, skills: e.target.value.split("\n") })}
          />
        </Field>
      </section>

      {/* Project overrides */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-cyan-300">GitHub Pinned Projects — Overrides</h2>
        <Field label="Include repo names (comma-separated)">
          <input
            className={inputClass}
            value={includedText}
            onChange={(e) => {
              setIncludedText(e.target.value);
              setData({
                ...data,
                projectOverrides: {
                  ...data.projectOverrides,
                  included: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                },
              });
            }}
          />
        </Field>
        <p className="text-xs text-white/40">
          Pinned repos are pulled live from GitHub. Leave blank to show everything pinned, or list
          specific repo names here to show only those.
        </p>
      </section>

      <div className="sticky bottom-0 bg-[#0a0a0c] pt-4 pb-2 flex items-center gap-3 border-t border-white/10">
        <button
          onClick={save}
          disabled={status === "saving"}
          className="rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-sm font-medium px-4 py-2 transition-colors"
        >
          {status === "saving" ? "Saving..." : "Save changes"}
        </button>
        {status === "saved" && <span className="text-xs text-green-400">Saved</span>}
        {status === "error" && <span className="text-xs text-red-400">{errorMsg}</span>}
      </div>
    </main>
  );
}
