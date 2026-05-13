import { z } from "zod";

export const dashboardCaseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  category: z.string(),
  status: z.string(),
  urgency: z.enum(["low", "medium", "high", "emergency"]),
  nextAction: z.string().nullable()
});

export type DashboardCase = z.infer<typeof dashboardCaseSchema>;
