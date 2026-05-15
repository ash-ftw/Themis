export const roleRoutes = {
  citizen: ["/citizen/dashboard", "/citizen/laws", "/citizen/profile"],
  lawyer: ["/lawyer/dashboard", "/lawyer/profile", "/lawyer/verification-pending"],
  admin: ["/admin/dashboard", "/admin/laws"]
} as const;
