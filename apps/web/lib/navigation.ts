export const roleRoutes = {
  citizen: [
    "/citizen/dashboard",
    "/citizen/cases",
    "/citizen/laws",
    "/citizen/assessments/new",
    "/citizen/complaints/new",
    "/citizen/rti/new",
    "/citizen/profile",
    "/notifications"
  ],
  lawyer: [
    "/lawyer/dashboard",
    "/lawyer/requests",
    "/lawyer/cases",
    "/lawyer/profile",
    "/lawyer/verification-pending",
    "/notifications"
  ],
  admin: ["/admin/dashboard", "/admin/laws", "/admin/lawyers", "/notifications"]
} as const;
