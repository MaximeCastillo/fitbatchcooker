import { login, signup } from "./actions";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

// A Server Component with a plain <form>. The buttons point at Server Actions via
// formAction, so no client-side JavaScript is needed for auth to work.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">{strings.login.title}</h1>

      <form className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {strings.login.email}
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {strings.login.password}
          <input
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete="current-password"
            className="rounded-md border border-input bg-background px-3 py-2 font-normal"
          />
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" formAction={login} className="flex-1">
            {strings.login.signIn}
          </Button>
          <Button
            type="submit"
            formAction={signup}
            variant="outline"
            className="flex-1"
          >
            {strings.login.signUp}
          </Button>
        </div>
      </form>
    </main>
  );
}
