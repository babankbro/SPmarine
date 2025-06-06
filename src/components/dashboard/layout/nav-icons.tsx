import type { Icon } from "@phosphor-icons/react/dist/lib/types";
import { Boat as BoatIcon } from "@phosphor-icons/react/dist/ssr/Boat";
import { ChartPie as ChartPieIcon } from "@phosphor-icons/react/dist/ssr/ChartPie";
import { Garage as GarageIcon } from "@phosphor-icons/react/dist/ssr/Garage";
import { GearSix as GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { PlugsConnected as PlugsConnectedIcon } from "@phosphor-icons/react/dist/ssr/PlugsConnected";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { Users as UsersIcon } from "@phosphor-icons/react/dist/ssr/Users";
import { XSquare } from "@phosphor-icons/react/dist/ssr/XSquare";

export const navIcons = {
	"chart-pie": ChartPieIcon,
	"gear-six": GearSixIcon,
	"plugs-connected": PlugsConnectedIcon,
	"x-square": XSquare,
	user: UserIcon,
	boat: BoatIcon,
	users: UsersIcon,
	garage: GarageIcon,
} as Record<string, Icon>;
