"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, ShieldAlert } from "lucide-react";

import type { AssessmentCategory, AssessmentQuestion } from "@/lib/api";

export function AssessmentForm({
  action,
  categories
}: {
  action: (formData: FormData) => void;
  categories: AssessmentCategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.key ?? "");
  const activeCategory = useMemo(
    () => categories.find((category) => category.key === selectedCategory) ?? categories[0],
    [categories, selectedCategory]
  );

  return (
    <form action={action} className="space-y-6">
      <section className="rounded-md border border-amber-200 bg-amber-50 p-4 shadow-panel md:p-5">
        <div className="flex gap-3">
          <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-amber-950">Informational assessment</h2>
            <p className="mt-1 text-sm leading-6 text-amber-900">
              The result suggests possible categories and sections for review. It is not legal
              advice and does not confirm that any law applies to your situation.
            </p>
            <label className="mt-3 flex items-start gap-2 text-sm text-amber-950">
              <input
                className="mt-1 h-4 w-4 rounded border-amber-400"
                name="disclaimer_accepted"
                required
                type="checkbox"
                value="true"
              />
              I understand this is informational and should be reviewed before action.
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="block lg:col-span-3">
            <span className="text-sm font-medium text-slate-700">Issue category</span>
            <select
              className="focus-ring mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm"
              name="issue_category"
              onChange={(event) => setSelectedCategory(event.target.value)}
              required
              value={selectedCategory}
            >
              {categories.map((category) => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-md border border-cyan-100 bg-cyan-50 p-4 lg:col-span-3">
            <div className="flex items-start gap-3">
              <ClipboardCheck aria-hidden="true" className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-semibold">{activeCategory?.label}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {activeCategory?.description}
                </p>
              </div>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">State</span>
            <input
              className="focus-ring mt-2 h-11 w-full rounded-md border border-border px-3 text-sm"
              name="state"
              placeholder="State"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">District</span>
            <input
              className="focus-ring mt-2 h-11 w-full rounded-md border border-border px-3 text-sm"
              name="district"
              placeholder="District"
              required
            />
          </label>
        </div>
      </section>

      <section className="rounded-md border border-border bg-white p-4 shadow-panel md:p-5">
        <h2 className="text-base font-semibold">Assessment questions</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {activeCategory?.questions.map((question) => (
            <QuestionField key={question.key} question={question} />
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          className="focus-ring inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
          type="submit"
        >
          Analyze assessment
        </button>
      </div>
    </form>
  );
}

function QuestionField({ question }: { question: AssessmentQuestion }) {
  const name = `answer_${question.key}`;
  const commonClass = "focus-ring mt-2 w-full rounded-md border border-border px-3 text-sm";

  if (question.input_type === "textarea") {
    return (
      <label className="block lg:col-span-2">
        <span className="text-sm font-medium text-slate-700">{question.label}</span>
        <textarea
          className={`${commonClass} min-h-32 py-3`}
          name={name}
          required={question.required}
        />
      </label>
    );
  }

  if (question.input_type === "select") {
    return (
      <label className="block">
        <span className="text-sm font-medium text-slate-700">{question.label}</span>
        <select
          className={`${commonClass} h-11 bg-white`}
          name={name}
          required={question.required}
        >
          {question.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (question.input_type === "boolean") {
    return (
      <label className="flex min-h-11 items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
        <input className="h-4 w-4 rounded border-border" name={name} type="checkbox" value="true" />
        <span className="font-medium text-slate-700">{question.label}</span>
      </label>
    );
  }

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{question.label}</span>
      <input
        className={`${commonClass} h-11`}
        name={name}
        required={question.required}
        type={question.input_type}
      />
    </label>
  );
}
