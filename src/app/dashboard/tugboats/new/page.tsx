"use client";

import Grid from "@mui/material/Unstable_Grid2";
import dayjs from "dayjs";
import axios from "axios";
import { Button, Divider, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from "@mui/material";
import { Card, CardActions, CardContent, CardHeader } from "@mui/material";
import { FormEvent, useState } from "react";

import { Tugboat } from "@/types/tugboat";
import { http } from "@/http";

export default function Page() {
  const [formData, setFormData] = useState<Tugboat>({
    id: "",
    name: "",
    maxCapacity: 0,
    maxBarge: 0,
    maxFuelCon: 0,
    type: "SEA",
    minSpeed: 0,
    maxSpeed: 0,
    engineRpm: 0,
    horsePower: 0,
    latitude: 0,
    longitude: 0,
    waterStatus: "SEA",
    distanceKm: 0,
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
      const res = await axios.post(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/tugboats`, formData)
      if (res.status == 201) {
        alert('success');
        window.history.back();
      }
      else
        alert('failed');
    } catch (e) {
      console.error("failed: ", e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
    >
      <Card>
        <CardHeader subheader="The information can be edited" title="add tugboat" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* Name */}
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

            {/* Max Capacity */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Max Capacity</InputLabel>
                <OutlinedInput
                  label="Max Capacity"
                  value={formData.maxCapacity}
                  onChange={handleChange}
                  name="maxCapacity"
                />
              </FormControl>
            </Grid>

            {/* Max Barge */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Max Barge</InputLabel>
                <OutlinedInput
                  label="Max Barge"
                  value={formData.maxBarge}
                  onChange={handleChange}
                  name="maxBarge" />
              </FormControl>
            </Grid>

            {/* Max FuelCon */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Max FuelCon</InputLabel>
                <OutlinedInput
                  label="Max FuelCon"
                  value={formData.maxFuelCon}
                  onChange={handleChange}
                  name="maxFuelCon" />
              </FormControl>
            </Grid>

            {/* Type */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                  name="type"
                  variant="outlined"
                >
                  <MenuItem value="SEA">SEA</MenuItem>
                  <MenuItem value="RIVER">RIVER</MenuItem>
                </Select>
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

            {/* Min Speed & Min Speed */}
            <Grid container spacing={2}>
              <Grid md={6} xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Min Speed</InputLabel>
                  <OutlinedInput
                    label="Min Speed"
                    value={formData.minSpeed}
                    onChange={handleChange}
                    name="minSpeed"
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Max Speed</InputLabel>
                  <OutlinedInput
                    label="Max Speed"
                    value={formData.maxSpeed}
                    onChange={handleChange}
                    name="maxSpeed"
                  />
                </FormControl>
              </Grid>
            </Grid>


            {/* Engine Rpm */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Engine Rpm</InputLabel>
                <OutlinedInput
                  label="Engine Rpm"
                  value={formData.engineRpm}
                  onChange={handleChange}
                  name="engineRpm" />
              </FormControl>
            </Grid>

            {/* Horse Power */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Horse Power</InputLabel>
                <OutlinedInput
                  label="Horse Power"
                  value={formData.horsePower}
                  onChange={handleChange}
                  name="horsePower" />
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