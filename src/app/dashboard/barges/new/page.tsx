"use client";

import React, { useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import dayjs from "dayjs";
import axios from "axios";
import { 
  Button, 
  Divider, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  OutlinedInput, 
  Select,
  Card, 
  CardActions, 
  CardContent, 
  CardHeader,
  Snackbar,
  Alert
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { FormEvent } from "react";

import type { Barge } from "@/types/barge";

export default function Page(): React.ReactNode {
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

  const [notification, setNotification] = useState<{ message: string; severity: "success" | "error" } | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>): void => {
    const name = e.target.name as keyof Barge;
    const value = e.target.value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: 
        name === "weight" || 
        name === "capacity" || 
        name === "latitude" || 
        name === "longitude" ||
        name === "distanceKm" ||
        name === "setupTime"
          ? Number(value)
          : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent): void => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name as keyof Barge]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.API_ENDPOINT}/${process.env.API_VERSION}/barges`, formData);
      if (response.status === 201) {
        setNotification({ message: "Success! Barge created.", severity: "success" });
        setOpenSnackbar(true);
        setTimeout(() => {
          window.history.back();
        }, 1500);
      }
      else {
        setNotification({ message: "Failed to create barge. Please try again.", severity: "error" });
        setOpenSnackbar(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setNotification({ message: `Failed to create barge: ${errorMessage}`, severity: "error" });
      setOpenSnackbar(true);
    }
  }

  const handleSnackbarClose = (): void => {
    setOpenSnackbar(false);
  };

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
                  label="Weight"
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
                  onChange={handleSelectChange}
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
                  name="setupTime" />
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
                  name="readyDatetime" />
              </FormControl>
            </Grid>

          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <Button variant="contained" type="submit">Add new</Button>
        </CardActions>
      </Card>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        {notification ? (
          <Alert 
            onClose={handleSnackbarClose} 
            severity={notification.severity} 
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </form>
  )
}