// Enhanced Station Selection with Search and Filter
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  Stack,
  InputAdornment,
  FormControl,
  FormHelperText,
  Divider,
  ListItem,
  Avatar,
  Grid,
  SelectChangeEvent,
} from "@mui/material";
import {
  MapPin as LocationIcon,
  Buildings as BuildingsIcon,
  MagnifyingGlass as SearchIcon,
} from "@phosphor-icons/react/dist/ssr";

import { useStation } from "@/hooks/use-station";
import { Station } from "@/types/station";

interface BasicSearchableStationSelectProps {
  value?: string;
  onChange: (event:React.SyntheticEvent<Element, Event>, station: Station) => void;
  error?: string;
  onErrorClear?: () => void;
}

// OPTION 1: Basic Autocomplete with Search
const BasicSearchableStationSelect = ({ 
  value, 
  onChange, 
  error, 
  onErrorClear 
}: BasicSearchableStationSelectProps) => {
  const {
    data: stations,
    isLoading: isStationsLoading,
    isError: isStationsError,
    error: stationsError
  } = useStation();

  const handleStationChange = (event:React.SyntheticEvent<Element, Event>, station: Station | null ) => {
    const selectedStationId = station?.id || '';
    const selectedStation = station;
    
    // Call the onChange callback with the station data
    onChange(event, station || {} as Station);
    
    // Clear error if provided
    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  return (
    <Grid item xs={12}>
      <Autocomplete
        options={stations || []}
        getOptionLabel={(station) => `${station.name} (${station.id})`}
        value={stations?.find(s => s.id === value) || null}
        onChange={handleStationChange}
        loading={!!isStationsLoading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search & Select Station"
            placeholder="Type to search stations..."
            error={!!error}
            helperText={error || 'Search by station name or ID'}
            required
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={20} />
                </InputAdornment>
              ),
            }}
          />
        )}
        renderOption={(props, station: Station) => (
          <Box component="li" {...props}>
            <Stack direction="row" alignItems="center" spacing={2} width="100%">
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: station.type === 'SEA' ? 'primary.main' : 'secondary.main' 
              }}>
                <BuildingsIcon size={16} />
              </Avatar>
              <Stack sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {station.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {station.id} • Distance: {station.distanceKm}km
                </Typography>
              </Stack>
              <Chip 
                label={station.type} 
                color={station.type === 'SEA' ? 'primary' : 'secondary'}
                size="small"
              />
            </Stack>
          </Box>
        )}
        filterOptions={(options, { inputValue }) => {
          const filtered = options.filter((station) =>
            station.name.toLowerCase().includes(inputValue.toLowerCase()) ||
            station.id.toLowerCase().includes(inputValue.toLowerCase()) ||
            station.type.toLowerCase().includes(inputValue.toLowerCase())
          );
          return filtered;
        }}
        noOptionsText="No stations found. Try different search terms."
        clearOnBlur={false}
        selectOnFocus
        handleHomeEndKeys
        freeSolo={false}
        size="small"
      />
    </Grid>
  );
};



export default BasicSearchableStationSelect;