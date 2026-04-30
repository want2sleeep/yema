import { AuthForm } from "../../components/auth-form";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; returnTo?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialMode = resolvedSearchParams.mode === "register" ? "register" : "login";
  const returnTo = resolvedSearchParams.returnTo?.startsWith("/") ? resolvedSearchParams.returnTo : "/submissions";

  return <AuthForm initialMode={initialMode} returnTo={returnTo} />;
}
