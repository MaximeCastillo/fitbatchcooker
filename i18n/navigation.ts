import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware drop-in replacements for next/link and next/navigation. Using these
// keeps the active locale in the URL when navigating (e.g. an English user stays under
// `/en/...`). Import these instead of `next/link` / `next/navigation` for app routes.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
