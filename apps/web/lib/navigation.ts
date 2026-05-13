export const roleRoutes = {
  citizen: ["/citizen/dashboard", "/citizen/profile"],
  lawyer: ["/lawyer/dashboard", "/lawyer/profile", "/lawyer/verification-pending"],
  admin: ["/admin/dashboard"]
} as const;
