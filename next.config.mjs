/** @type {import('next').NextConfig} */

const config = {
	env: {
		API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:18001",
		API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || "v1",

		SCHEDULE_API_ENDPOINT: process.env.NEXT_PUBLIC_SCHEDULE_API_ENDPOINT || "http://62.72.30.12:19002",
		SCHEDULE_API_VERSION: process.env.NEXT_PUBLIC_SCHEDULE_API_VERSION || "",
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
};

export default config;
