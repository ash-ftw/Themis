export const roleRoutes = {
  citizen: [
    "/citizen/dashboard",
    "/citizen/laws",
    "/citizen/assessments/new",
    "/citizen/complaints/new",
    "/citizen/profile"
  ],
  lawyer: ["/lawyer/dashboard", "/lawyer/profile", "/lawyer/verification-pending"],
  admin: ["/admin/dashboard", "/admin/laws"]
} as const;
