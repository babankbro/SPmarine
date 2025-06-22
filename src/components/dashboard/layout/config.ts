import type { NavItemConfig } from "@/types/nav";
import { paths } from "@/paths";

export const navItems = [
	{ key: "overview", title: "Overview", href: paths.dashboard.overview, icon: "chart-pie" },
	{ 
		key: "components", 
		title: "Components", 
		icon: "boat",
		items: [
			{ key: "customers", title: "Customers", href: paths.dashboard.customers, icon: "users" },
			{ key: "barges", title: "Barge", href: paths.dashboard.barges, icon: "boat" },
			{ key: "carriers", title: "Carrier", href: paths.dashboard.carriers, icon: "boat" },
			{ key: "tugboats", title: "Tugboat", href: paths.dashboard.tugboats, icon: "boat" },
			{ key: "stations", title: "Stations", href: paths.dashboard.stations, icon: "garage" },
		]
	},
	{ key: "orders", title: "Orders", href: paths.order, icon: "order" },
	{ 
		key: "results", 
		title: "Report Results", 
		icon: "money",
		items: [
			{ key: "tugboat_consumption", title: "Tugboat Consumption", href: paths.dashboard.costs, icon: "money" },
			{ key: "tugboat_schedule", title: "Tugboat Schedule", href: paths.dashboard.costs, icon: "boat" },
			{ key: "barge_usage", title: "Barge Usage", href: paths.dashboard.costs, icon: "boat" },
			{ key: "grants", title: "Tugboat Grant", href: paths.dashboard.costs, icon: "boat" },
		]
	}
] satisfies NavItemConfig[];