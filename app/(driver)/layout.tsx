import { AppShell } from "@/components/layout/app-shell";
import { DriverAreaGate } from "@/features/driver/components/driver-area-gate";
import { driverNavItems } from "@/lib/navigation/items";

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <DriverAreaGate>
      <AppShell title="Driver" navItems={driverNavItems}>
        {children}
      </AppShell>
    </DriverAreaGate>
  );
}
