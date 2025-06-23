"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
// import Timeline from "react-calendar-timeline";
import moment from "moment";
import "moment/locale/th"; // โหลด locale ภาษาไทย

moment.locale("th"); // กำหนด locale เป็นไทย
import { useTugboatScheduleTimeline } from "@/hooks/use-tugboat-schedule-timeline";
import "react-calendar-timeline/dist/style.css";
import Timeline, { TimelineHeaders, SidebarHeader, DateHeader } from "react-calendar-timeline";
import { FormControl, InputLabel, Select, MenuItem, Grid, Button } from "@mui/material";
import { http } from "@/http";
import { Order } from "@/types/order";
import { Tugboat } from "@/types/tugboat";
import { TugboatScheduleFilters as Filters } from "@/types/tugboat-schedule";
import { TugboatScheduleFilters } from "@/components/dashboard/tugboat-schedule/tugboat-schedule-filters";

export default function TugboatTimelinePage() {
	const scheduleTypeColors: Record<string, string> = {
		Start: "#28a745",
		"Barge Collection": "#007bff",
		"Barge Step Collection": "#17a2b8",
		"Start Order Carrier": "#ffc107",
		"Crane-Carrier": "#6c757d",
		Appointment: "#6f42c1",
		"Sea-River": "#20c997",
		"Barge Release": "#dc3545",
		"Barge Step Release": "#fd7e14",
		"Barge Change": "#8BC34A",
		"Barge Change Collection": "#4CAF50",
		"Customer Station": "#6495ED",
		"River-River": "#4682B4",
		"Loader-Customer": "#D2B48C",
	};

	const [tugboats, setTugboats] = React.useState<Tugboat[]>([]);
	const [orders, setOrders] = React.useState<Order[]>([]);
	const [filters, setFilters] = React.useState<Filters>({
		tugboat_id: "",
		order_id: "",
		enter_datetime: "",
		exit_datetime: "",
		type: "",
		type_point: "",
	});

	React.useEffect(() => {
		http.get<Tugboat[]>("tugboats").then((res) => setTugboats(res.data));
		http.get<Order[]>("orders").then((res) => setOrders(res.data));
	}, []);

	const { schedules, loading, error } = useTugboatScheduleTimeline(filters);

	if (loading) return <p className="p-4">Loading...</p>;
	if (error) return <p className="p-4 text-red-500">Error loading data</p>;
	if (!schedules) return null;
	console.log(schedules);
	if (Array.isArray(schedules)) {
		const timelineData = schedules as any[];
		const tugboatMap = new Map();
		const groups: { id: number; title: string }[] = [];
		const items: any[] = [];
		timelineData.forEach((entry: any, index: number) => {
			const tugName = entry?.tugboat_id || "Unknown";
			if (!tugboatMap.has(tugName)) {
				const groupId = tugboatMap.size + 1;
				tugboatMap.set(tugName, groupId);
				groups.push({ id: groupId, title: tugName });
			}
			const groupId = tugboatMap.get(tugName);
			const start = moment(entry.enter_datetime);
			let end = moment(entry.exit_datetime);
			if (start.valueOf() === end.valueOf()) {
				end = start.clone().add(1, "minutes");
			}

			const enter_datetime = new Date(entry.enter_datetime).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			});
			const exit_datetime = new Date(entry.exit_datetime).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			});
			items.push({
				id: index,
				group: groupId,
				title: `#${entry.type} ${entry.tugboat_id} ${entry.order_id} ${enter_datetime}น. - ${exit_datetime}น.`,
				start_time: start.valueOf(),
				end_time: end.valueOf(),
				type: entry.type,
			});
		});
		const minStart = Math.min(...items.map((item) => item.start_time));
		const maxEnd = Math.max(...items.map((item) => item.end_time));
		return (
			<div>
				<TugboatScheduleFilters filters={filters} onChange={setFilters} />
				<div className="p-6">
					<h1 className="text-2xl font-bold mb-4">🚢 Tugboat Timeline</h1>
					<div className="w-full min-w-0 h-[70vh] overflow-x-auto overflow-y-auto">
						<Timeline
							groups={groups}
							items={items}
							defaultTimeStart={minStart}
							defaultTimeEnd={maxEnd}
							// canMove={false}
							// canResize={false}
							// stackItems
							// itemTouchSendsClick={false}
							// itemHeightRatio={0.75}
							lineHeight={60}
							itemRenderer={({ item, timelineContext, itemContext, getItemProps, getResizeProps }) => {
								const type = item.type;
								const bgColor = scheduleTypeColors[type] || "#1976d2";
								return (
									<div
										{...getItemProps({
											style: {
												background: bgColor,
												color: "#fff",
												borderRadius: 6,
												border: "none",
												fontWeight: 500,
												fontSize: "0.95rem",
												boxShadow: "0 2px 8px rgba(25, 118, 210, 0.1)",
												...(itemContext.selected && { outline: "2px solid #1565c0" }),
											},
										})}
									>
										<div
											style={{ padding: "4px 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
										>
											{item.title}
										</div>
									</div>
								);
							}}
						>
							<TimelineHeaders className="sticky">
								<SidebarHeader>
									{({ getRootProps }) => {
										return <div {...getRootProps()}>Left</div>;
									}}
								</SidebarHeader>
								<DateHeader unit="primaryHeader" />
								<DateHeader />
								{/* <DateHeader
									unit="primaryHeader"
									labelFormat={(date, unit, labelWidth) => {
										// console.log(date)
										// console.log(moment(date))
										// เพิ่ม 543 ปี เพื่อแสดงเป็น พ.ศ.
										return moment(date.$d).format("llll");
									}}
								/>
									 
								<DateHeader /> */}

								{/* <DateHeader unit="primaryHeader" /> */}
								{/* <DateHeader
									unit="primaryHeader"
									labelFormat={(start, end) => {
										try {
											const label = moment(start.$d).format("LLLL");
											return label;
										} catch (e) {
											console.warn("Invalid primaryHeader start:", start);
											return "-";
										}
									}}
								/> */}
							</TimelineHeaders>
						</Timeline>
					</div>
				</div>
			</div>
		);
	}
	return null;
}
