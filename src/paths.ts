export const paths = {
	home: "/",
	auth: { signIn: "/auth/sign-in", signUp: "/auth/sign-up", resetPassword: "/auth/reset-password" },
	dashboard: {
		overview: "/dashboard",
		customers: "/dashboard/customers",
		carriers: "/dashboard/carriers",
		barges: "/dashboard/barges",
		tugboats: "/dashboard/tugboats",
		stations: "/dashboard/stations",
		costs: "/dashboard/costs",
	    account: "/dashboard/account",
		// integrations: "/dashboard/integrations",
		 settings: "/dashboard/settings",
	},
	errors: { notFound: "/errors/not-found" },
} as const;