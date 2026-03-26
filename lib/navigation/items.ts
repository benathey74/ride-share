import { ROUTES } from "@/lib/constants/routes";
import type { BottomNavItem } from "./types";

export const passengerNavItems: BottomNavItem[] = [
  { href: ROUTES.home, label: "Home", icon: "home" },
  { href: ROUTES.passengerSearch, label: "Search", icon: "search" },
  {
    href: ROUTES.passengerMyTrips,
    label: "Trips",
    icon: "trips",
    riderTripSlot: true,
  },
  { href: ROUTES.profile, label: "Profile", icon: "profile" },
];

export const driverNavItems: BottomNavItem[] = [
  { href: ROUTES.driverDashboard, label: "Drive", icon: "dashboard" },
  { href: ROUTES.driverRoutes, label: "Routes", icon: "driverRoutes" },
  { href: ROUTES.profile, label: "Profile", icon: "profile" },
];

export const adminNavItems: BottomNavItem[] = [
  { href: ROUTES.adminDashboard, label: "Admin", icon: "admin" },
  { href: ROUTES.profile, label: "Profile", icon: "profile" },
];

export const sharedNavItems: BottomNavItem[] = [
  { href: ROUTES.home, label: "Ride", icon: "home" },
  { href: ROUTES.driverDashboard, label: "Drive", icon: "dashboard" },
  { href: ROUTES.adminDashboard, label: "Admin", icon: "admin" },
  { href: ROUTES.profile, label: "Profile", icon: "profile" },
];
