"use client";

import Grid from "@mui/material/Unstable_Grid2";
import dayjs from "dayjs";
import axios from "axios";
import { Button, Divider, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from "@mui/material";
import { Card, CardActions, CardContent, CardHeader } from "@mui/material";
import { FormEvent, useState } from "react";

import { Barge } from "@/types/barge";

export default function Page() {
  const [formData, setFormData] = useState<Barge>({
    id: "",
    name: "",
    weight: 0,
    capacity: 0,
    latitude: 0,
    longitude: 0,
    waterStatus: "SEA",
    stationId: "",
    distanceKm: 0,
    setupTime: 0,
    readyDatetime: dayjs().format("YYYY-MM-DDTHH:mm"),
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxCapacity" || name === "maxBarge" || name === "maxFuelCon" ||
              name === "minSpeed" || name === "maxSpeed" || name === "engineRpm" ||
              name === "horsePower" || name === "latitude" || name === "longitude" ||
              name === "distanceKm"
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/barges`, formData)
      if (res.data.status === 201)
        alert("failed")

      alert('success');
      window.history.back();
    } catch (e) {
      console.error("failed: ", e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
    >
      <Card>
        <CardHeader subheader="The information can be added" title="add barge" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* Id */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Id</InputLabel>
                <OutlinedInput
                  label="Id"
                  value={formData.id}
                  onChange={handleChange}
                  name="id"
                />
              </FormControl>
            </Grid>

            {/* Name */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Name</InputLabel>
                <OutlinedInput
                  label="Name"
                  value={formData.name}
                  onChange={handleChange}
                  name="name"
                />
              </FormControl>
            </Grid>

            {/* Weight */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Weight</InputLabel>
                <OutlinedInput
                  label="Max Capacity"
                  value={formData.weight}
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
                  value={formData.capacity}
                  onChange={handleChange}
                  name="capacity" />
              </FormControl>
            </Grid>

            {/* Station Id */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Station Id</InputLabel>
                <OutlinedInput
                  label="Station Id"
                  value={formData.stationId}
                  onChange={handleChange}
                  name="stationId" />
              </FormControl>
            </Grid>

            {/* Water Status */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Water Status</InputLabel>
                <Select
                  value={formData.waterStatus}
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
                    value={formData.longitude}
                    onChange={handleChange}
                    name="longitude" />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Latitude</InputLabel>
                  <OutlinedInput
                    label="Latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    name="latitude" />
                </FormControl>
              </Grid>
            </Grid>

            {/* DistanceKm */}
            <Grid md={6} xs={12}>
              <FormControl required>
                <InputLabel>Distance Km</InputLabel>
                <OutlinedInput
                  label="Distance Km"
                  value={formData.distanceKm}
                  onChange={handleChange}
                  name="distanceKm" />
              </FormControl>
            </Grid>

            {/* SetupTime */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>SetupTime</InputLabel>
                <OutlinedInput
                  label="SetupTime"
                  value={formData.setupTime}
                  onChange={handleChange}
                  name="SetupTime" />
              </FormControl>
            </Grid>

            {/* ReadyDateTime	 */}
            <Grid md={6} xs={12}>
              <FormControl required>
                <InputLabel>Ready DateTime</InputLabel>
                <OutlinedInput
                  label="Ready DateTime"
                  type="datetime-local"
                  value={formData.readyDatetime || ""}
                  onChange={handleChange}
                  name="readyDateTime" />
              </FormControl>
            </Grid>

          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button variant="contained" type="submit">Add new</Button>
        </CardActions>
      </Card>
    </form>
  )
}