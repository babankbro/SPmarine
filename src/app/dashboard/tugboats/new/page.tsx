"use client";

import * as React from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import type { ChangeEvent, FormEvent } from "react";

interface Tugboat {
  id: string;
  name: string;
  maxCapacity: number;
  maxBarge: number;
  maxFuelCon: number;
  type: string;
  minSpeed: number;
  maxSpeed: number;
  engineRpm: number;
  horsePower: number;
  latitude: number;
  longitude: number;
  waterStatus: string;
  distanceKm: number;
  readyDatetime: string;
}

export default function Page(): React.JSX.Element {
  const router = useRouter();

  const [notification, setNotification] = React.useState<{ message: string; severity: "success" | "error" } | null>(null);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const [formData, setFormData] = React.useState<Tugboat>({
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    
    try {
      const response = await axios.post(
        `${process.env.API_ENDPOINT}/${process.env.API_VERSION}/tugboats`,
        formData
      );
      
      if (response.status === 201) {
        setNotification({ message: "Tugboat created successfully", severity: "success" });
        setOpenSnackbar(true);
        setTimeout(() => {
          router.push("/dashboard/tugboats");
        }, 1500);
      } else {
        setNotification({ message: "Failed to create tugboat. Please try again.", severity: "error" });
        setOpenSnackbar(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setNotification({ message: `Failed to create tugboat: ${errorMessage}`, severity: "error" });
      setOpenSnackbar(true);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFormData((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.type === "number" ? Number(event.target.value) : event.target.value,
    }));
  };

  const handleFlagChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFormData((prevState) => ({
      ...prevState,
      type: event.target.value,
    }));
  };

  const handleWaterStatusChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFormData((prevState) => ({
      ...prevState,
      waterStatus: event.target.value,
    }));
  };

  const handleSnackbarClose = (): void => {
    setOpenSnackbar(false);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
      >
        <Card>
          <CardHeader subheader="The information can be edited" title="Add Tugboat" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Id"
                  name="id"
                  onChange={handleChange}
                  required
                  value={formData.id}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  onChange={handleChange}
                  required
                  value={formData.name}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Max Capacity"
                  name="maxCapacity"
                  onChange={handleChange}
                  required
                  type="number"
                  value={formData.maxCapacity}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Max Barge"
                  name="maxBarge"
                  onChange={handleChange}
                  required
                  type="number"
                  value={formData.maxBarge}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Max FuelCon"
                  name="maxFuelCon"
                  onChange={handleChange}
                  required
                  type="number"
                  value={formData.maxFuelCon}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Type"
                  name="type"
                  onChange={handleFlagChange}
                  required
                  select
                  SelectProps={{ native: true }}
                  value={formData.type}
                >
                  <option value="SEA">SEA</option>
                  <option value="RIVER">RIVER</option>
                </TextField>
              </Grid>

              <Grid container spacing={2}>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Min Speed"
                    name="minSpeed"
                    onChange={handleChange}
                    required
                    type="number"
                    value={formData.minSpeed}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Max Speed"
                    name="maxSpeed"
                    onChange={handleChange}
                    required
                    type="number"
                    value={formData.maxSpeed}
                  />
                </Grid>
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Engine Rpm"
                  name="engineRpm"
                  onChange={handleChange}
                  required
                  type="number"
                  value={formData.engineRpm}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Horse Power"
                  name="horsePower"
                  onChange={handleChange}
                  required
                  type="number"
                  value={formData.horsePower}
                />
              </Grid>

              <Grid container>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="longitude"
                    onChange={handleChange}
                    required
                    type="number"
                    value={formData.longitude}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="latitude"
                    onChange={handleChange}
                    required
                    type="number"
                    value={formData.latitude}
                  />
                </Grid>
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Distance Km"
                  name="distanceKm"
                  onChange={handleChange}
                  required
                  type="number"
                  value={formData.distanceKm}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Ready DateTime"
                  name="readyDatetime"
                  onChange={handleChange}
                  required
                  type="datetime-local"
                  value={formData.readyDatetime}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Water Status"
                  name="waterStatus"
                  onChange={handleWaterStatusChange}
                  required
                  select
                  SelectProps={{ native: true }}
                  value={formData.waterStatus}
                >
                  <option value="SEA">SEA</option>
                  <option value="RIVER">RIVER</option>
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button variant="contained" type="submit">Add new</Button>
          </CardActions>
        </Card>
      </form>
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
    </div>
  );
}