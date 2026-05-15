import { cookies } from "next/headers";

import { AssessmentForm } from "@/features/assessments/assessment-form";
import { getAssessmentCategories } from "@/lib/api";

import { submitAssessment } from "./actions";

export default async function NewAssessmentPage() {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const categoryResponse = token ? await getAssessmentCategories(token).catch(() => null) : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Guided assessment</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Answer the structured questions to generate possible issue categories, legal references,
          and an evidence checklist for review.
        </p>
      </div>

      {categoryResponse ? (
        <AssessmentForm action={submitAssessment} categories={categoryResponse.categories} />
      ) : (
        <div className="rounded-md border border-border bg-white p-6 text-sm text-muted-foreground shadow-panel">
          Sign in and sync your profile before starting an assessment.
        </div>
      )}
    </div>
  );
}
