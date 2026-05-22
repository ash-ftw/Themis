import { cookies } from "next/headers";

import { LandingPage } from "@/components/landing/landing-page";
import { getHealth } from "@/lib/api";
import { isAppRole, roleHome } from "@/lib/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get("themis-role")?.value;
  const activeRole = isAppRole(role) ? role : null;
  const apiOnline = await getHealth()
    .then(() => true)
    .catch(() => false);

  return (
    <LandingPage
      apiOnline={apiOnline}
      dashboardHref={activeRole ? roleHome[activeRole] : null}
      signedInRole={activeRole}
    />
  );
}
