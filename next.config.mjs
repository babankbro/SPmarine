/** @type {import('next').NextConfig} */

const config = {
	env: {
		API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:18001",
		API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || "v1",
	},
};

export default config;
