"use client";

import React from "react";
import type { ReactNode } from "react";
import RouterLink from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Divider,
  Stack,
  Typography
} from "@mui/material";

import type { NavItemConfig } from "@/types/nav";
import { navItems } from "@/components/dashboard/layout/config";
import { navIcons } from "@/components/dashboard/layout/nav-icons";
import { isNavItemActive } from "@/lib/is-nav-item-active";
import { Logo } from "@/components/core/logo";
import { paths } from "@/paths";

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        "--SideNav-background": "var(--mui-palette-neutral-950)",
        "--SideNav-color": "var(--mui-palette-common-white)",
        "--NavItem-color": "var(--mui-palette-neutral-300)",
        "--NavItem-hover-background": "rgba(255, 255, 255, 0.04)",
        "--NavItem-active-background": "var(--mui-palette-primary-main)",
        "--NavItem-active-color": "var(--mui-palette-primary-contrastText)",
        "--NavItem-disabled-color": "var(--mui-palette-neutral-500)",
        "--NavItem-icon-color": "var(--mui-palette-neutral-400)",
        "--NavItem-icon-active-color": "var(--mui-palette-primary-contrastText)",
        "--NavItem-icon-disabled-color": "var(--mui-palette-neutral-600)",
        bgcolor: "var(--SideNav-background)",
        color: "var(--SideNav-color)",
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        height: "100%",
        left: 0,
        maxWidth: "100%",
        position: "fixed",
        scrollbarWidth: "none",
        top: 0,
        width: "var(--SideNav-width)",
        zIndex: "var(--SideNav-zIndex)",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box component={RouterLink} href={paths.home} sx={{ display: "inline-flex" }}>
          <Logo height={64} width={128} />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: "var(--mui-palette-neutral-700)" }} />
      <Box component="nav" sx={{ flex: "1 1 auto", p: "12px" }}>
        {renderNavItems({ pathname, items: navItems })}
      </Box>
    </Box>
  );
}

function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
  const children = items.reduce((acc: ReactNode[], curr: NavItemConfig): ReactNode[] => {
    const { key, ...item } = curr;

    acc.push(<NavItem key={key} pathname={pathname} {...item} />);

    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, "items"> {
  pathname: string;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <Box
        {...(href
          ? {
              component: external ? "a" : RouterLink,
              href,
              target: external ? "_blank" : undefined,
              rel: external ? "noreferrer" : undefined,
            }
          : { role: "button" })}
        sx={{
          alignItems: "center",
          borderRadius: 1,
          color: "var(--NavItem-color)",
          cursor: "pointer",
          display: "flex",
          flex: "0 0 auto",
          gap: 1,
          p: "6px 16px",
          position: "relative",
          textDecoration: "none",
          whiteSpace: "nowrap",
          ...(disabled && {
            bgcolor: "var(--NavItem-disabled-background)",
            color: "var(--NavItem-disabled-color)",
            cursor: "not-allowed",
          }),
          ...(active && { bgcolor: "var(--NavItem-active-background)", color: "var(--NavItem-active-color)" }),
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", flex: "0 0 auto" }}>
          {Icon ? (
            <Icon
              fill={active ? "var(--NavItem-icon-active-color)" : "var(--NavItem-icon-color)"}
              fontSize="var(--icon-fontSize-md)"
              weight={active ? "fill" : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: "1 1 auto" }}>
          <Typography
            component="span"
            sx={{ color: "inherit", fontSize: "0.875rem", fontWeight: 500, lineHeight: "28px" }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}