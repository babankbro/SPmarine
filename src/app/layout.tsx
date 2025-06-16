import * as React from "react";
import type { Viewport } from "next";

import "@/styles/global.css";
import { UserProvider } from "@/contexts/user-context";
import { ThemeProvider } from "@/components/core/theme-provider/theme-provider";
import { ReactQueryProvider } from "@/lib/providers";

export const viewport = { width: "device-width", initialScale: 1 } satisfies Viewport;

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
	return (
		<html lang="en">
			<body>
				<ReactQueryProvider>
					<UserProvider>
						<ThemeProvider>{children}</ThemeProvider>
					</UserProvider>
				</ReactQueryProvider>
			</body>
		</html>
	);
}
