import { SharedWorkspaceShell } from "./shared-workspace-shell";

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return <SharedWorkspaceShell>{children}</SharedWorkspaceShell>;
}
