import { AuthPage } from "@/components/auth-page";
import { HomeContent } from "@/components/home-content";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <AuthPage />;
  }

  return <HomeContent />;
}
