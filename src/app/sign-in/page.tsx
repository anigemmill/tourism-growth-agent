import { Compass } from "lucide-react";
import { signIn } from "./actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5 justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <Compass className="h-5 w-5" />
          </div>
          <div className="text-base font-semibold">Tourism Growth Intelligence</div>
        </div>

        <form action={signIn} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6">
          <input type="hidden" name="next" value={next ?? "/"} />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Name (optional)</span>
            <input
              type="text"
              name="name"
              placeholder="Jane Smith"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </label>
          <button
            type="submit"
            className="mt-2 h-10 rounded-lg bg-brand text-brand-foreground text-sm font-medium hover:opacity-90"
          >
            Continue
          </button>
          <p className="text-xs text-foreground-subtle">
            No password required in this build — there&apos;s no external identity provider configured. The first person
            to open a business becomes its Owner; everyone after that joins as a Viewer (see Settings to change
            roles).
          </p>
        </form>
      </div>
    </div>
  );
}
