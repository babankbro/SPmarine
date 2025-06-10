"use client";

import { Button, Divider, FormControl, InputLabel, OutlinedInput, Select } from "@mui/material";
import { Card, CardHeader, CardContent, CardActions, MenuItem } from "@mui/material";
import { JSX, useContext, useEffect } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import dayjs from "dayjs";

import { BargeContext, BargeContextType } from "@/contexts/barge-context";

interface Props {
	id: string;
}

export function BargeDetailsForm({ id }: Props): JSX.Element {
	const { selectedBarge, getById } = useContext<BargeContextType>(BargeContext);

	useEffect(() => {
		if (id && getById) getById(id);
	}, [id, getById]);

	const handleChange = () => {};

	console.log(selectedBarge);

	return (
		<form
		// onSubmit={(event) => {
		//   event.preventDefault();
		// }}
		>
			<Card>
				<CardHeader subheader="The information can be edited" title="edit tugboat" />
				<Divider />
				<CardContent>
					<Grid container spacing={3}>
						{/* Id */}
						<Grid md={6} xs={12}>
							<FormControl fullWidth required>
								<InputLabel>Id</InputLabel>
								<OutlinedInput label="Id" value={selectedBarge?.id} onChange={handleChange} name="id" />
							</FormControl>
						</Grid>

						{/* Name */}
						<Grid md={6} xs={12}>
							<FormControl fullWidth required>
								<InputLabel>Name</InputLabel>
								<OutlinedInput label="Name" value={selectedBarge?.name} onChange={handleChange} name="name" />
							</FormControl>
						</Grid>

						{/* Weight */}
						<Grid md={6} xs={12}>
							<FormControl fullWidth required>
								<InputLabel>Weight</InputLabel>
								<OutlinedInput
									label="Max Capacity"
									value={selectedBarge?.weight}
									onChange={handleChange}
									name="weight"
								/>
							</FormControl>
						</Grid>

						{/* Capacity */}
						<Grid md={6} xs={12}>
							<FormControl fullWidth required>
								<InputLabel>Capacity</InputLabel>
								<OutlinedInput
									label="Capacity"
									value={selectedBarge?.capacity}
									onChange={handleChange}
									name="capacity"
								/>
							</FormControl>
						</Grid>

						{/* Station Id */}
						<Grid md={6} xs={12}>
							<FormControl fullWidth>
								<InputLabel>Station Id</InputLabel>
								<OutlinedInput
									label="Station Id"
									value={selectedBarge?.stationId}
									onChange={handleChange}
									name="stationId"
								/>
							</FormControl>
						</Grid>

						{/* Water Status */}
						<Grid md={6} xs={12}>
							<FormControl fullWidth>
								<InputLabel>Water Status</InputLabel>
								<Select
									value={selectedBarge?.waterStatus}
									onChange={handleChange}
									label="Water Status"
									name="waterStatus"
									variant="outlined"
								>
									<MenuItem value="SEA">SEA</MenuItem>
									<MenuItem value="RIVER">RIVER</MenuItem>
								</Select>
							</FormControl>
						</Grid>

						{/* Latitude & Longitude */}
						<Grid container>
							<Grid md={6} xs={12}>
								<FormControl fullWidth required>
									<InputLabel>Longitude</InputLabel>
									<OutlinedInput
										label="Longitude"
										value={selectedBarge?.longitude}
										onChange={handleChange}
										name="longitude"
									/>
								</FormControl>
							</Grid>
							<Grid md={6} xs={12}>
								<FormControl fullWidth required>
									<InputLabel>Latitude</InputLabel>
									<OutlinedInput
										label="Latitude"
										value={selectedBarge?.latitude}
										onChange={handleChange}
										name="latitude"
									/>
								</FormControl>
							</Grid>
						</Grid>

						{/* DistanceKm */}
						<Grid md={6} xs={12}>
							<FormControl required>
								<InputLabel>Distance Km</InputLabel>
								<OutlinedInput
									label="Distance Km"
									value={selectedBarge?.distanceKm}
									onChange={handleChange}
									name="distanceKm"
								/>
							</FormControl>
						</Grid>

						{/* SetupTime */}
						<Grid md={6} xs={12}>
							<FormControl fullWidth required>
								<InputLabel>SetupTime</InputLabel>
								<OutlinedInput
									label="SetupTime"
									value={selectedBarge?.setupTime}
									onChange={handleChange}
									name="SetupTime"
								/>
							</FormControl>
						</Grid>

						{/* ReadyDateTime	 */}
						<Grid md={6} xs={12}>
							<FormControl required>
								<InputLabel>Ready DateTime</InputLabel>
								<OutlinedInput
									label="Ready DateTime"
									type="datetime-local"
									value={selectedBarge?.readyDatetime || ""}
									onChange={handleChange}
									name="readyDateTime"
								/>
							</FormControl>
						</Grid>
					</Grid>
				</CardContent>
				<Divider />
				<CardActions sx={{ justifyContent: "flex-end" }}>
					<Button variant="contained">Save details</Button>
				</CardActions>
			</Card>
		</form>
	);
}
