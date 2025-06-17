"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { useColorScheme } from "@mui/material/styles";

import { NoSsr } from "@/components/core/no-ssr";

const HEIGHT = 60;
const WIDTH = 60;

type Color = "dark" | "light";

export interface LogoProps {
	emblem?: boolean;
	height?: number;
	width?: number;
}

export interface DynamicLogoProps {
	colorDark?: Color;
	colorLight?: Color;
	emblem?: boolean;
	height?: number;
	width?: number;
}

export function Logo({ emblem, height = HEIGHT, width = WIDTH }: LogoProps): React.JSX.Element {
	let url: string = "/assets/intermarine_logo.png";

	// if (emblem) {
	// 	url = color === "light" ? "/assets/logo-emblem.svg" : "/assets/logo-emblem--dark.svg";
	// } else {
	// 	url = color === "light" ? "/assets/logo.svg" : "/assets/logo--dark.svg";
	// }

	return <Box alt="logo" component="img" height={height} src={url} width={width} />;
}

export function DynamicLogo({
	colorDark = "light",
	colorLight = "dark",
	height = HEIGHT,
	width = WIDTH,
	...props
}: DynamicLogoProps): React.JSX.Element {
	const { colorScheme } = useColorScheme();
	const color = colorScheme === "dark" ? colorDark : colorLight;

	return (
		<NoSsr fallback={<Box sx={{ height: `${height}px`, width: `${width}px` }} />}>
			<Logo height={height} width={width} {...props} />
		</NoSsr>
	);
}
