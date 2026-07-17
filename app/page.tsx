import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {APP_NAME}
      </h1>
      <p className="max-w-md text-lg text-muted-foreground">{APP_TAGLINE}</p>
      <Button render={<Link href="/recipes" />} size="lg">
        Voir les recettes
      </Button>
    </main>
  );
}
