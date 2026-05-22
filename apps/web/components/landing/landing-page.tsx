"use client";

import {
  ArrowRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FileText,
  Gavel,
  HelpCircle,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ComponentType } from "react";

import type { AppRole } from "@/lib/auth";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

type RoleJourney = {
  key: AppRole;
  label: string;
  title: string;
  summary: string;
  cta: string;
  href: string;
  icon: IconType;
  steps: string[];
};

type Feature = {
  key: string;
  title: string;
  audience: string;
  description: string;
  output: string;
  href: string;
  icon: IconType;
};

type OrientationStep = {
  title: string;
  body: string;
  callout: string;
  icon: IconType;
};

const roleJourneys: RoleJourney[] = [
  {
    key: "citizen",
    label: "Citizen",
    title: "Find the right path for a legal issue",
    summary:
      "Search legal sections, complete a guided assessment, prepare complaints or RTI drafts, manage cases, upload documents, and request legal aid.",
    cta: "Enter as citizen",
    href: "/auth/callback?role=citizen",
    icon: BriefcaseBusiness,
    steps: ["Search laws", "Assess issue", "Create case", "Request legal aid", "Track updates"]
  },
  {
    key: "lawyer",
    label: "Lawyer",
    title: "Review requests and support assigned cases",
    summary:
      "Complete verification, receive legal aid requests, accept suitable matters, review case history, and update hearings.",
    cta: "Enter as lawyer",
    href: "/auth/callback?role=lawyer",
    icon: Gavel,
    steps: ["Complete profile", "Get verified", "Review requests", "Accept case", "Update hearing"]
  },
  {
    key: "admin",
    label: "Admin",
    title: "Operate the platform with audit visibility",
    summary:
      "Verify lawyers, manage legal content, review users, monitor metrics, audit sensitive actions, and inspect notification failures.",
    cta: "Enter as admin",
    href: "/auth/callback?role=admin",
    icon: ShieldCheck,
    steps: ["Review metrics", "Verify lawyers", "Manage users", "Inspect audit logs", "Resolve failures"]
  }
];

const features: Feature[] = [
  {
    key: "laws",
    title: "Law Search",
    audience: "Citizens and admins",
    description:
      "Search legal sections by keyword, act, section number, category, and review status. Admins can create and update legal content.",
    output: "Plain-language legal references and reviewed content records.",
    href: "/citizen/laws",
    icon: Search
  },
  {
    key: "assessment",
    title: "Assessment",
    audience: "Citizens",
    description:
      "Answer guided questions so the system can organize the issue, suggest possible sections, and build an evidence checklist.",
    output: "A structured issue summary with next steps and complaint eligibility.",
    href: "/citizen/assessments/new",
    icon: ClipboardCheck
  },
  {
    key: "complaint",
    title: "Complaint Drafts",
    audience: "Citizens",
    description:
      "Generate an editable complaint draft from assessment answers or manual details, then export it or save it to a case.",
    output: "Editable complaint text linked to case records and documents.",
    href: "/citizen/complaints/new",
    icon: FileText
  },
  {
    key: "cases",
    title: "Cases and Hearings",
    audience: "Citizens and lawyers",
    description:
      "Create cases, update status, add hearing details, view timelines, and keep assigned lawyers focused on permitted matters.",
    output: "A shared case workspace with hearing history and timeline events.",
    href: "/citizen/cases",
    icon: BriefcaseBusiness
  },
  {
    key: "documents",
    title: "Documents and OCR",
    audience: "Citizens and lawyers",
    description:
      "Upload private case documents, request OCR, review extracted text, and use signed download links with access checks.",
    output: "Case documents with malware, OCR, privacy, and audit status.",
    href: "/citizen/cases",
    icon: FileSearch
  },
  {
    key: "legal-aid",
    title: "Legal Aid",
    audience: "Citizens, lawyers, admins",
    description:
      "Match eligible cases to verified lawyers, create legal aid requests, and let lawyers accept or decline with audit history.",
    output: "Transparent legal aid request workflow and case assignment.",
    href: "/lawyer/requests",
    icon: Users
  },
  {
    key: "rti",
    title: "RTI Drafts",
    audience: "Citizens",
    description:
      "Create Right to Information drafts for public authorities, edit the text, export it, or save it into a case.",
    output: "Structured RTI draft text and case-linked records.",
    href: "/citizen/rti/new",
    icon: BookOpen
  },
  {
    key: "notifications",
    title: "Notifications",
    audience: "All roles",
    description:
      "Keep legal aid decisions, hearings, RTI actions, and other updates visible in an in-app notification center.",
    output: "Read/unread notification history and delivery status.",
    href: "/notifications",
    icon: Bell
  },
  {
    key: "admin",
    title: "Admin Controls",
    audience: "Admins",
    description:
      "Monitor metrics, inspect audit logs, verify lawyers, manage users, review legal content, and investigate failed notifications.",
    output: "Operational visibility across sensitive platform workflows.",
    href: "/admin/dashboard",
    icon: Layers3
  }
];

const orientationSteps: OrientationStep[] = [
  {
    title: "Choose the workspace that matches your role",
    body:
      "Themis separates citizen, lawyer, and admin workflows so each user sees only the actions they are allowed to take.",
    callout: "Start from the role buttons or sign in screen.",
    icon: Users
  },
  {
    title: "Citizens move from issue to case",
    body:
      "Citizens can search legal content, complete an assessment, generate complaint or RTI drafts, upload documents, and request legal aid.",
    callout: "Use assessments when the issue needs structure before a case is created.",
    icon: ClipboardCheck
  },
  {
    title: "Lawyers work from verified requests",
    body:
      "Lawyers complete profile verification before legal aid requests and assigned case work become available.",
    callout: "Accepted requests assign the lawyer to the case automatically.",
    icon: Gavel
  },
  {
    title: "Admins keep the platform accountable",
    body:
      "Admins review lawyer verification, user status, legal content, audit logs, metrics, and notification failures.",
    callout: "Admin actions are audit logged for traceability.",
    icon: ShieldCheck
  },
  {
    title: "Sensitive work is protected",
    body:
      "Role checks, private document storage, signed download URLs, audit redaction, and readiness checks support pilot deployment.",
    callout: "Use the production runbook before opening the platform to real users.",
    icon: LockKeyhole
  }
];

const processSteps = [
  "Understand the issue",
  "Prepare a draft",
  "Create or update a case",
  "Attach documents",
  "Request or provide legal aid",
  "Track hearings and alerts"
];

export function LandingPage({
  apiOnline,
  dashboardHref,
  signedInRole
}: {
  apiOnline: boolean;
  dashboardHref: string | null;
  signedInRole: AppRole | null;
}) {
  const [selectedRole, setSelectedRole] = useState<RoleJourney>(roleJourneys[0]);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [orientationOpen, setOrientationOpen] = useState(false);
  const [orientationIndex, setOrientationIndex] = useState(0);

  const SelectedRoleIcon = selectedRole.icon;
  const currentOrientation = orientationSteps[orientationIndex];
  const OrientationIcon = currentOrientation.icon;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative min-h-[86svh] overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute inset-0 opacity-80">
          <WorkflowScene onSelectFeature={setSelectedFeature} />
        </div>

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 md:px-6 lg:px-8">
          <Link className="focus-ring inline-flex items-center gap-3 rounded-md" href="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-400 text-slate-950">
              <Gavel aria-hidden="true" className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold">Themis</span>
              <span className="block text-xs text-slate-300">Legal support workspace</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`hidden rounded-md border px-3 py-2 text-xs font-medium sm:inline-flex ${
                apiOnline
                  ? "border-emerald-300 bg-emerald-400/10 text-emerald-100"
                  : "border-red-300 bg-red-400/10 text-red-100"
              }`}
            >
              API {apiOnline ? "online" : "offline"}
            </span>
            <Link
              className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-white/20 px-3 text-sm font-medium text-white hover:bg-white/10"
              href="/login"
            >
              Sign in
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-16 md:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:px-8 lg:pb-16 lg:pt-24">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-md border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-100">
              Guided legal workflows for citizens, lawyers, and admins
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Move from legal confusion to organized action.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
              Themis connects legal search, assessments, complaint drafts, cases, hearings,
              documents, legal aid, RTI drafts, notifications, and audit controls in one workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-400 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
                onClick={() => {
                  setOrientationIndex(0);
                  setOrientationOpen(true);
                }}
                type="button"
              >
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                Start orientation
              </button>
              <a
                className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-slate-950 hover:bg-slate-100"
                href={dashboardHref ?? selectedRole.href}
              >
                {dashboardHref ? `Open ${signedInRole} dashboard` : selectedRole.cta}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <a
                className="focus-ring inline-flex h-11 items-center justify-center rounded-md border border-white/20 px-4 text-sm font-semibold text-white hover:bg-white/10"
                href="#how-it-works"
              >
                How it works
              </a>
            </div>
          </div>

          <div className="rounded-md border border-white/15 bg-slate-900/80 p-4 shadow-panel backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-300">Explore by role</p>
                <h2 className="mt-1 text-xl font-semibold">{selectedRole.label} journey</h2>
              </div>
              <SelectedRoleIcon aria-hidden="true" className="h-6 w-6 text-cyan-300" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {roleJourneys.map((role) => {
                const Icon = role.icon;
                const active = selectedRole.key === role.key;

                return (
                  <button
                    className={`focus-ring flex h-20 flex-col items-center justify-center gap-2 rounded-md border px-2 text-sm font-medium transition ${
                      active
                        ? "border-cyan-300 bg-cyan-400 text-slate-950"
                        : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                    }`}
                    key={role.key}
                    onClick={() => setSelectedRole(role)}
                    type="button"
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" />
                    {role.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-md border border-white/15 bg-white/5 p-4">
              <h3 className="text-lg font-semibold">{selectedRole.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedRole.summary}</p>
              <ol className="mt-4 grid gap-2">
                {selectedRole.steps.map((step, index) => (
                  <li className="flex items-center gap-3 text-sm" key={step}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-cyan-200">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white px-4 py-5 md:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
          <Signal label="Protected workflows" value="Role-based access" />
          <Signal label="Deployment state" value="Readiness endpoint" />
          <Signal label="Pilot support" value="Runbooks and E2E checks" />
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 lg:px-8" id="how-it-works">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">How Themis Works</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
              A guided path across the legal support lifecycle.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-6">
            {processSteps.map((step, index) => (
              <button
                className="focus-ring group min-h-32 rounded-md border border-border bg-white p-4 text-left shadow-panel transition hover:border-primary hover:bg-cyan-50"
                key={step}
                onClick={() => setSelectedFeature(features[Math.min(index, features.length - 1)])}
                type="button"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white group-hover:bg-primary">
                  {index + 1}
                </span>
                <span className="mt-4 block text-sm font-semibold">{step}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-primary">Function Orientation</p>
              <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
                Open any function to learn what it does.
              </h2>
            </div>
            <button
              className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
              onClick={() => {
                setOrientationIndex(0);
                setOrientationOpen(true);
              }}
              type="button"
            >
              <HelpCircle aria-hidden="true" className="h-4 w-4" />
              Guided tour
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <button
                  className="focus-ring min-h-48 rounded-md border border-border bg-background p-5 text-left shadow-panel transition hover:border-primary hover:bg-cyan-50"
                  key={feature.key}
                  onClick={() => setSelectedFeature(feature)}
                  type="button"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-primary shadow-panel">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="mt-4 block text-lg font-semibold">{feature.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-md border border-border bg-slate-950 p-6 text-white shadow-panel md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-medium text-cyan-200">Ready to enter the workspace?</p>
              <h2 className="mt-2 text-3xl font-semibold">Start with a role or continue your session.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                The local development sign-in uses role shortcuts. Production deployments should use
                the configured identity provider.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {roleJourneys.map((role) => (
                <a
                  className="focus-ring inline-flex h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-950 hover:bg-slate-100"
                  href={role.href}
                  key={role.key}
                >
                  {role.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedFeature ? (
        <FeatureModal feature={selectedFeature} onClose={() => setSelectedFeature(null)} />
      ) : null}

      {orientationOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6"
          role="dialog"
        >
          <div className="w-full max-w-2xl rounded-md border border-border bg-white shadow-panel">
            <div className="flex items-start justify-between gap-4 border-b border-border p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-cyan-50 text-primary">
                  <OrientationIcon aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Orientation {orientationIndex + 1} of {orientationSteps.length}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{currentOrientation.title}</h2>
                </div>
              </div>
              <button
                aria-label="Close orientation"
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted"
                onClick={() => setOrientationOpen(false)}
                type="button"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="leading-7 text-muted-foreground">{currentOrientation.body}</p>
              <div className="mt-5 rounded-md border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
                {currentOrientation.callout}
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={orientationIndex === 0}
                  onClick={() => setOrientationIndex((value) => Math.max(0, value - 1))}
                  type="button"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {orientationSteps.map((step, index) => (
                    <button
                      aria-label={`Go to ${step.title}`}
                      className={`h-2.5 w-8 rounded-full ${
                        index === orientationIndex ? "bg-primary" : "bg-slate-200"
                      }`}
                      key={step.title}
                      onClick={() => setOrientationIndex(index)}
                      type="button"
                    />
                  ))}
                </div>
                {orientationIndex === orientationSteps.length - 1 ? (
                  <button
                    className="focus-ring inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                    onClick={() => setOrientationOpen(false)}
                    type="button"
                  >
                    Finish
                  </button>
                ) : (
                  <button
                    className="focus-ring inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                    onClick={() =>
                      setOrientationIndex((value) =>
                        Math.min(orientationSteps.length - 1, value + 1)
                      )
                    }
                    type="button"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function WorkflowScene({ onSelectFeature }: { onSelectFeature: (feature: Feature) => void }) {
  const sceneItems = [
    { feature: features[1], className: "left-[58%] top-[18%]" },
    { feature: features[2], className: "left-[72%] top-[33%]" },
    { feature: features[4], className: "left-[53%] top-[55%]" },
    { feature: features[6], className: "left-[78%] top-[64%]" },
    { feature: features[8], className: "left-[38%] top-[38%]" }
  ];

  return (
    <div className="relative h-full w-full">
      <div className="absolute bottom-[-12%] right-[-6%] h-[58%] w-[58%] rounded-[999px] border border-cyan-300/20" />
      <div className="absolute right-[10%] top-[10%] h-[72%] w-[42%] rounded-md border border-white/10 bg-white/[0.03]" />
      {sceneItems.map(({ feature, className }) => {
        const Icon = feature.icon;

        return (
          <button
            className={`focus-ring absolute hidden min-h-24 w-44 rounded-md border border-white/15 bg-slate-900/90 p-3 text-left text-white shadow-panel backdrop-blur transition hover:border-cyan-300 hover:bg-slate-800 lg:block ${className}`}
            key={feature.key}
            onClick={() => onSelectFeature(feature)}
            type="button"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Icon aria-hidden="true" className="h-4 w-4 text-cyan-300" />
              {feature.title}
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-300">{feature.audience}</span>
          </button>
        );
      })}
    </div>
  );
}

function FeatureModal({ feature, onClose }: { feature: Feature; onClose: () => void }) {
  const Icon = feature.icon;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6"
      role="dialog"
    >
      <div className="w-full max-w-xl rounded-md border border-border bg-white shadow-panel">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-cyan-50 text-primary">
              <Icon aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">{feature.audience}</p>
              <h2 className="mt-1 text-xl font-semibold">{feature.title}</h2>
            </div>
          </div>
          <button
            aria-label="Close function details"
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-5 p-5">
          <div>
            <h3 className="text-sm font-semibold">What it does</h3>
            <p className="mt-2 leading-7 text-muted-foreground">{feature.description}</p>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 text-emerald-700" />
              <div>
                <h3 className="text-sm font-semibold text-emerald-950">Expected result</h3>
                <p className="mt-1 text-sm leading-6 text-emerald-900">{feature.output}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
              href={feature.href}
            >
              Open function
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
            <button
              className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted"
              onClick={onClose}
              type="button"
            >
              Keep exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-background p-4">
      <MessageSquareText aria-hidden="true" className="h-5 w-5 text-primary" />
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="mt-1 text-sm text-muted-foreground">{value}</div>
      </div>
    </div>
  );
}
