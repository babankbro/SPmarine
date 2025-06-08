import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";

export const navItems = [
	{ key: "overview", title: "Overview", href: paths.dashboard.overview, icon: "chart-pie" },
	{ key: "customers", title: "Customers", href: paths.dashboard.customers, icon: "users" },
  { key: "barges", title: "Barge", href: paths.dashboard.barges, icon: "boat" },
  { key: "carriers", title: "Carrier", href: paths.dashboard.carriers, icon: "boat" },
	{ key: "tugboats", title: "Tugboat", href: paths.dashboard.tugboats, icon: "boat" },
	{ key: "stations", title: "Stations", href: paths.dashboard.stations, icon: "garage" },
	{ key: "costs", title: "Costs", href: paths.dashboard.costs, icon: "money" },
] satisfies NavItemConfig[];