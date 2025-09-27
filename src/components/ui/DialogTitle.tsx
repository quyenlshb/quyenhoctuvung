import { ReactNode } from "react";

export function DialogTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-lg font-semibold">{children}</h2>
  );
}
