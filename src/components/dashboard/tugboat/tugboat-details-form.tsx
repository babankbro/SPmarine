"use client";

import { Button, Divider, FormControl, InputLabel, OutlinedInput, Select } from "@mui/material";
import { Card, CardHeader, CardContent, CardActions, MenuItem } from "@mui/material";
import { JSX, useContext, useEffect } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import dayjs from "dayjs";

import { TugboatContext, TugboatContextType } from "@/contexts/tugboat-context";

interface Props {
  id: string;
}

export function TugboatDetailsForm({ id }: Props): JSX.Element {
  const { selectedTugboat, getById } = useContext<TugboatContextType>(TugboatContext);
  
  useEffect(() => {
    if (id && getById)
      getById(id)
  }, [id, getById]);

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
            {/* Name */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Name</InputLabel>
                <OutlinedInput defaultValue={selectedTugboat?.name} label="Name" name="name" />
              </FormControl>
            </Grid>

            {/* Max Capacity */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Max Capacity</InputLabel>
                <OutlinedInput defaultValue={selectedTugboat?.maxCapacity} label="Max Capacity" name="maxCapacity" />
              </FormControl>
            </Grid>

            {/* Max Barge */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Max Barge</InputLabel>
                <OutlinedInput defaultValue={selectedTugboat?.maxBarge} label="Max Barge" name="maxBarge" />
              </FormControl>
            </Grid>

            {/* Max FuelCon */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Max FuelCon</InputLabel>
                <OutlinedInput defaultValue={selectedTugboat?.maxFuelCon} label="Max FuelCon" name="maxFuelCon" />
              </FormControl>
            </Grid>

            {/* Type */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select defaultValue="New York" label="Type" name="type" variant="outlined">
                  <MenuItem value="Sea">SEA</MenuItem>
                  <MenuItem value="River">RIVER</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Water Status */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Water Status</InputLabel>
                <Select label="Water Status" name="waterStatus" variant="outlined">
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
                    defaultValue={selectedTugboat?.minSpeed}
                    name="minSpeed"
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Max Speed</InputLabel>
                  <OutlinedInput
                    label="Max Speed"
                    defaultValue={selectedTugboat?.maxSpeed}
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
                  defaultValue={selectedTugboat?.engineRpm}
                  name="engineRpm" />
              </FormControl>
            </Grid>

            {/* Horse Power */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Horse Power</InputLabel>
                <OutlinedInput
                  label="Horse Power"
                  defaultValue={selectedTugboat?.horsePower}
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
                    defaultValue={selectedTugboat?.longitude}
                    name="longitude" />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Latitude</InputLabel>
                  <OutlinedInput
                    label="Latitude"
                    defaultValue={selectedTugboat?.latitude}
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
                  defaultValue={selectedTugboat?.distanceKm}
                  name="distanceKm" />
              </FormControl>
            </Grid>

            {/* ReadyDateTime	 */}
            <Grid md={6} xs={12}>
              <FormControl required>
                <InputLabel>Ready DateTime</InputLabel>
                <OutlinedInput
                  label="Ready DateTime"
                  defaultValue={dayjs(selectedTugboat?.readyDatetime).format("MM/DD/YYYY HH:mm:ss")}
                  name="readyDateTime" />
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
