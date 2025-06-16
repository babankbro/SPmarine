// src/components/dashboard/costs/cost-table.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Autocomplete,
  Chip,
  TextField
} from "@mui/material";
import type { Cost } from "@/types/cost";
import { useTugboat } from "@/hooks/use-tugboat";
import { useOrder } from "@/hooks/use-order";

interface CostTableProps {
  costs: Cost[];
  isLoading: boolean;
}

// A reusable summary card component

const SummaryCard = ({ 
  label, 
  value, 
  unit,
  colorIndex = 0 // Add color variation based on index
}: { 
  label: string; 
  value: number; 
  unit: string;
  colorIndex?: number;
}): React.JSX.Element => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
  
  // Limited color palette
  const colors = [
    { bg: '#e3f2fd', text: '#0d47a1', border: '#2196f3' }, // Blue theme
    { bg: '#e8f5e9', text: '#1b5e20', border: '#4caf50' }, // Green theme
    { bg: '#fff8e1', text: '#ff8f00', border: '#ffc107' }, // Amber theme
    { bg: '#f3e5f5', text: '#6a1b9a', border: '#9c27b0' }  // Purple theme
  ];
  
  const colorTheme = colors[colorIndex % colors.length];

  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%',
        backgroundColor: colorTheme.bg,
        borderLeft: `4px solid ${colorTheme.border}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            mt: 1, 
            fontWeight: 'bold',
            color: colorTheme.text 
          }}
        >
          {formattedValue}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {unit}
        </Typography>
      </CardContent>
    </Card>
  );
};

export function CostTable({ costs, isLoading }: CostTableProps): React.JSX.Element {
    const tugboatContext = useTugboat();
    const orderContext = useOrder();
    const [totalWeight, setTotalWeight] = useState(0);
    const [totalDistance, setTotalDistance] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [totalFuelConsumption, setTotalFuelConsumption] = useState(0);
    const [filteredCosts, setFilteredCosts] = useState<Cost[]>([]);
    const [selectedTugboats, setSelectedTugboats] = useState<string[]>([]);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    // Process data and update state when dependencies change
    useEffect(() => {
        // Filter costs based on selected tugboats
        const newFilteredCosts = costs.filter(cost => {
            // If no tugboats selected, show all records
            if (selectedTugboats.length === 0) return true;
            return selectedTugboats.includes(cost.TugboatId);

            // Filter by selected tugboat IDs
            //return selectedTugboats.includes(cost.TugboatId) && selectedOrders.includes(cost.OrderId);
        });

        // Calculate summary statistics based on filtered data
        const calculatedTotalWeight = selectedTugboats.length === 0 ? 
            newFilteredCosts.reduce((sum, cost) => sum + cost.TotalLoad, 0)/2 :
            newFilteredCosts.reduce((sum, cost) => sum + cost.TotalLoad, 0); 

        const calculatedTotalDistance = newFilteredCosts.reduce((sum, cost) => sum + cost.Distance, 0);
        const calculatedTotalTime = newFilteredCosts.reduce((sum, cost) => sum + cost.Time, 0);
        const calculatedFuelConsumption = newFilteredCosts.reduce(
            (sum, cost) => sum + (cost.Time * cost.ConsumptionRate), 0
        );

       
        // Debug logging
        // console.log('Summary statistics recalculated:');
        // console.log('Total Weight:', calculatedTotalWeight);
        // console.log('Total Distance:', calculatedTotalDistance);
        // console.log('Total Time:', calculatedTotalTime);
        // console.log('Total Fuel Consumption:', calculatedFuelConsumption);
        // console.log('Filtered costs length:', newFilteredCosts.length);
        // console.log('Costs length:', costs.length);
        // console.log('Tugboat list:', tugboatContext.tugboat);

        // Update state with calculated values
        setTotalWeight(calculatedTotalWeight);
        setTotalDistance(calculatedTotalDistance);
        setTotalTime(calculatedTotalTime);
        setTotalFuelConsumption(calculatedFuelConsumption);
        setFilteredCosts(newFilteredCosts);
    }, [costs, selectedTugboats, selectedOrders, tugboatContext.tugboat, orderContext.data]);

    // Format number with commas as thousands separators and 2 decimal places
    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            {/* Tugboat filter */}
            <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Autocomplete
                    multiple
                    id="tugboat-filter"
                    options={tugboatContext.tugboat?.map(t => t.id) || []}
                    getOptionLabel={(option: string) => {
                        const tugboat = tugboatContext.tugboat?.find((t) => t.id === option);
                        return tugboat?.name || option;
                    }}
                    value={selectedTugboats}
                    onChange={(_, newValue: string[]) => {
                        setSelectedTugboats(newValue);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label="Filter by Tugboat"
                            placeholder="Select tugboats"
                            sx={{ width: 350 }}
                        />
                    )}
                    renderTags={(value: readonly string[], getTagProps) =>
                        value.map((option: string, index: number) => (
                            <Chip
                                {...getTagProps({ index })}
                                color="primary"
                                variant="outlined"
                                key={option}
                            />
                        ))
                    }
                />
                
                {/* Order filter - similar to tugboat filter, but for orders */}
                <Autocomplete
                    multiple
                    id="order-filter"
                    options={orderContext.data?.map(o => o.id) ?? []}
                    value={selectedOrders}
                    onChange={(_, newValue: string[]) => {
                        setSelectedOrders(newValue);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label="Filter by Order"
                            placeholder="Select orders"
                            sx={{ width: 350 }}
                        />
                    )}
                    renderTags={(value: readonly string[], getTagProps) =>
                        value.map((option: string, index: number) => (
                            <Chip
                                {...getTagProps({ index })}
                                color="secondary"
                                variant="outlined"
                                key={option}
                            />
                        ))
                    }
                />
            </Box>
            
            {/* Summary cards section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard 
                        label="Total Weight Moved" 
                        value={totalWeight} 
                        unit="tons" 
                        colorIndex={0}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard 
                        label="Total Distance Traveled" 
                        value={totalDistance} 
                        unit="kilometers" 
                        colorIndex={1}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard 
                        label="Total Travel Time" 
                        value={totalTime} 
                        unit="hours" 
                        colorIndex={2}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <SummaryCard 
                        label="Total Fuel Used" 
                        value={totalFuelConsumption} 
                        unit="liters" 
                        colorIndex={3}
                    />
                </Grid>
            </Grid>
            
            {/* Data table */}
            <TableContainer component={Paper} sx={{ 
                maxHeight: '600px', 
                boxShadow: 3,
                borderRadius: 2,
                overflow: 'auto'
            }}>
                <Table stickyHeader aria-label="cost table">
                    <TableHead sx={{ 
                        backgroundColor: 'primary.main', 
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Tugboat ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Order</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Weight (tons)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Distance (km)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Travel Time (hrs)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Liters/hr</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Fuel Used (liters)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Liters/ton</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCosts.length > 0 ? (
                            filteredCosts.map((cost, index) => {
                                const tugboat = tugboatContext.tugboat?.find(t => t.id === cost.TugboatId);
                                const fuelUsed = cost.Time * cost.ConsumptionRate;
                                const litersPerTon = cost.TotalLoad > 0 ? fuelUsed / cost.TotalLoad : 0;
                                
                                return (
                                    <TableRow
                                        key={`${cost.TugboatId}-${cost.OrderId}-${Math.random().toString(36).substr(2, 9)}`}
                                        hover
                                        sx={{ 
                                            backgroundColor: index % 2 === 0 ? 'white' : '#f5f5f5',
                                            transition: 'background-color 0.2s',
                                            '&:hover': {
                                                backgroundColor: '#e3f2fd',
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 'medium' }}>{tugboat?.name || cost.TugboatId}</TableCell>
                                        <TableCell>{cost.OrderId}</TableCell>
                                        <TableCell>{formatNumber(cost.TotalLoad)}</TableCell>
                                        <TableCell>{formatNumber(cost.Distance)}</TableCell>
                                        <TableCell>{formatNumber(cost.Time)}</TableCell>
                                        <TableCell>{formatNumber(cost.ConsumptionRate)}</TableCell>
                                        <TableCell sx={{ 
                                            color: fuelUsed > 500 ? '#d32f2f' : '#2e7d32',
                                            fontWeight: 'bold'
                                        }}>
                                            {formatNumber(fuelUsed)}
                                        </TableCell>
                                        <TableCell>{formatNumber(litersPerTon)}</TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No cost data found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}