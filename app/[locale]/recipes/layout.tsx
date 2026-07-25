import type { ReactNode } from "react";

// The `modal` parallel-route slot renders the intercepting recipe modal (@modal/(.)[id])
// on top of the recipes list, so the list underneath stays mounted (filters + scroll
// preserved). It's empty (default.tsx → null) until a card is tapped.
export default function RecipesLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
