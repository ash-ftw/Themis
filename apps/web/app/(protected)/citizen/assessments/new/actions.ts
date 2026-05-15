"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { analyzeAssessment, answerAssessment, startAssessment } from "@/lib/api";

export async function submitAssessment(formData: FormData) {
  const token = (await cookies()).get("themis-session")?.value ?? "";
  const issueCategory = valueOf(formData, "issue_category");
  const assessment = await startAssessment(token, {
    issue_category: issueCategory,
    state: valueOf(formData, "state"),
    district: valueOf(formData, "district"),
    disclaimer_accepted: formData.get("disclaimer_accepted") === "true"
  });

  await answerAssessment(token, assessment.id, {
    answers: answersFromFormData(formData)
  });
  await analyzeAssessment(token, assessment.id);

  redirect(`/citizen/assessments/${assessment.id}`);
}

function answersFromFormData(formData: FormData) {
  const answers: Record<string, string | boolean> = {};
  for (const [key, rawValue] of formData.entries()) {
    if (!key.startsWith("answer_")) {
      continue;
    }
    const answerKey = key.replace("answer_", "");
    const value = rawValue.toString();
    answers[answerKey] = value === "true" ? true : value;
  }
  return answers;
}

function valueOf(formData: FormData, key: string) {
  return formData.get(key)?.toString() ?? "";
}
