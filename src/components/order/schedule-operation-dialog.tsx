// src/components/order/schedule-operation-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Paper,
  TableContainer,
  Tooltip,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { 
  Play as PlayIcon,
  Clock as ClockIcon,
  CheckCircle as CheckIcon,
  XCircle as ErrorIcon
} from "@phosphor-icons/react/dist/ssr";
import axios from "axios";
import { useOrderContext } from "@/contexts/order-context";
import { useEntityNames } from "@/hooks/use-entity-names";
import { Order } from "@/types/order";

interface ScheduleOperationDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ScheduleFormData {
  startTime: Date;
  endTime: Date;
  timeCompute: number; // in minutes
  description: string;
}

interface ScheduleProgress {
  step: number;
  message: string;
  progress: number;
  status: 'waiting' | 'running' | 'completed' | 'error';
  startedAt?: Date;
  completedAt?: Date;
}

const steps = [
  'Validating Input Data',
  'Processing Schedule Computation',
  'Optimizing Routes',
  'Generating Results',
  'Finalizing Schedule'
];

// API Configuration using environment variables
const API_CONFIG = {
  SCHEDULE_ENDPOINT: 'http://127.0.0.1:5000/orders/multiple',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    // Add auth headers if needed
    // 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY || ''}`,
    
  }
};

export function ScheduleOperationDialog({ open, onClose }: ScheduleOperationDialogProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    startTime: new Date(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    timeCompute: 1, // Default 1 minute
    description: ''
  });

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<ScheduleProgress>({
    step: 0,
    message: 'Ready to start',
    progress: 0,
    status: 'waiting'
  });
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Add state for selected orders
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  // Get orders data from context
  const { data: orders, isLoading: isLoadingOrders } = useOrderContext();
  
  // Get entity names for display
  const { 
    getStationName, 
    getCustomerName, 
    isLoading: isLoadingNames 
  } = useEntityNames();

  const handleInputChange = (field: keyof ScheduleFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'timeCompute' ? Number(event.target.value) : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: 'startTime' | 'endTime') => (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, [field]: date }));
    }
  };

  // Handle order selection
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };
  
  // Handle "select all" orders
  const handleSelectAllOrders = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked && orders) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const validateForm = (): boolean => {
    if (formData.endTime <= formData.startTime) {
      setError('End time must be after start time');
      return false;
    }
    if (formData.timeCompute <= 0) {
      setError('Time compute must be greater than 0');
      return false;
    }
    if (selectedOrders.length === 0) {
      setError('Please select at least one order');
      return false;
    }
    setError('');
    return true;
  };

  const simulateProgress = async (stepIndex: number, duration: number) => {
    const stepDuration = duration / 100;
    
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      
      setProgress(prev => ({
        ...prev,
        progress: i,
        message: `${steps[stepIndex]} - ${i}%`
      }));
    }
  };

  const runScheduleOperation = async () => {
    if (!validateForm()) return;

    console.log('Starting schedule operation with selected orders:', selectedOrders);
    setIsRunning(true);
    setError('');
    setResult(null);

    try {
      setProgress({
        step: 0,
        message: 'Starting schedule operation...',
        progress: 0,
        status: 'running',
        startedAt: new Date()
      });

      // Process each step
      for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
        setProgress(prev => ({
          ...prev,
          step: stepIndex,
          message: `Starting ${steps[stepIndex]}...`,
          progress: 0,
        }));

        // Simulate API call with progress updates
        await simulateProgress(stepIndex, 1000);
      }

      // Prepare selected order data
      const selectedOrderData = orders?.filter(order => 
        selectedOrders.includes(order.id)
      ) || [];

      const order_ids = selectedOrderData.map(order => order.id);
      console.log('Selected order IDs:', order_ids);

      // Actual API call would happen here
      // Replace this with your actual API integration
      const response = await axios.post(API_CONFIG.SCHEDULE_ENDPOINT, {
        scheduleConfig: {
          startTime: formData.startTime.toISOString(),
          endTime: formData.endTime.toISOString(),
          timeCompute: formData.timeCompute,
          description: formData.description
        },
        order_ids: order_ids
      }, {
        headers: API_CONFIG.HEADERS,
        timeout: API_CONFIG.TIMEOUT
      });

      const data = response.data;

      // Set completion status
      setProgress(prev => ({
        ...prev,
        status: 'completed',
        message: 'Operation completed successfully',
        completedAt: new Date()
      }));

      setResult(data);
      console.log('Schedule operation completed successfully:', data);

    } catch (error) {
      console.error('Schedule operation failed:', error);
      
      setProgress(prev => ({
        ...prev,
        status: 'error',
        message: 'Operation failed',
        completedAt: new Date()
      }));

      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleClose = () => {
    if (!isRunning) {
      setFormData({
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timeCompute: 60,
        description: ''
      });
      setProgress({
        step: 0,
        message: 'Ready to start',
        progress: 0,
        status: 'waiting'
      });
      setResult(null);
      setError('');
      setSelectedOrders([]);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'running': return 'primary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon size={20} />;
      case 'error': return <ErrorIcon size={20} />;
      case 'running': return <CircularProgress size={20} />;
      default: return <ClockIcon size={20} />;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={isRunning ? undefined : handleClose}
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Schedule Operation
        </DialogTitle>

        {error && (
          <Alert severity="error" sx={{ mx: 3 }}>
            {error}
          </Alert>
        )}

        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Form Section */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Operation Configuration
                  </Typography>
                  
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Operation Description"
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    disabled={isRunning}
                  />

                  <DateTimePicker
                    label="Start Time"
                    value={formData.startTime}
                    onChange={handleDateChange('startTime')}
                    slotProps={{
                      textField: {
                        margin: 'normal',
                        fullWidth: true,
                        disabled: isRunning
                      }
                    }}
                  />

                  <DateTimePicker
                    label="End Time"
                    value={formData.endTime}
                    onChange={handleDateChange('endTime')}
                    slotProps={{
                      textField: {
                        margin: 'normal',
                        fullWidth: true,
                        disabled: isRunning
                      }
                    }}
                  />

                  <TextField
                    margin="normal"
                    fullWidth
                    type="number"
                    label="Time Compute (minutes)"
                    value={formData.timeCompute}
                    onChange={handleInputChange('timeCompute')}
                    disabled={isRunning}
                    inputProps={{ min: 1, max: 1440 }}
                    helperText="Duration for the computation process"
                  />
                </Grid>

                {/* Order Selection Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Select Orders
                  </Typography>
                  
                  {isLoadingOrders || isLoadingNames ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : orders && orders.length > 0 ? (
                    <TableContainer component={Paper} sx={{ maxHeight: 300, overflow: 'auto' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox">
                              <Checkbox
                                indeterminate={selectedOrders.length > 0 && selectedOrders.length < orders.length}
                                checked={orders.length > 0 && selectedOrders.length === orders.length}
                                onChange={handleSelectAllOrders}
                              />
                            </TableCell>
                            <TableCell>Order ID</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>From</TableCell>
                            <TableCell>To</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {orders.map((order) => {
                            const fromName = getStationName(order.startStationId) || 'Unknown';
                            const toName = getStationName(order.destStationId) || 'Unknown';
                            
                            return (
                              <TableRow 
                                key={order.id} 
                                hover
                                onClick={() => handleOrderSelect(order.id)}
                                sx={{ cursor: 'pointer' }}
                              >
                                <TableCell padding="checkbox">
                                  <Checkbox 
                                    checked={selectedOrders.includes(order.id)}
                                    onChange={() => handleOrderSelect(order.id)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Tooltip title={order.id}>
                                    <Typography variant="body2" noWrap>
                                      {order.id.substring(0, 8)}...
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={order.type} 
                                    color={order.type === 'IMPORT' ? 'primary' : 'secondary'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>{fromName}</TableCell>
                                <TableCell>{toName}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">No orders available</Alert>
                  )}
                  
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {selectedOrders.length} orders selected
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Progress Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Operation Progress
              </Typography>

              {progress.startedAt && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Started: {progress.startedAt.toLocaleTimeString()}
                    </Typography>
                    {progress.completedAt && (
                      <Typography variant="body2" color="text.secondary">
                        Completed: {progress.completedAt.toLocaleTimeString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              <Stepper activeStep={progress.step} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step}>
                    <StepLabel>
                      {step}
                    </StepLabel>
                    <StepContent>
                      {index === progress.step && progress.status === 'running' && (
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress.progress} 
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {progress.message}
                          </Typography>
                        </Box>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {/* Results Display */}
              {result && (
                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Operation Results
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                            handleClose();
                            window.location.href = '/dashboard/costs';
                        }}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 2,
                        }}
                      >
                        View Cost Analysis
                      </Button>
                        </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleClose} 
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Close'}
          </Button>
          <Button 
            onClick={runScheduleOperation}
            variant="contained"
            disabled={isRunning || progress.status === 'completed' || selectedOrders.length === 0}
            startIcon={isRunning ? <CircularProgress size={16} /> : <PlayIcon size={16} />}
          >
            {isRunning ? 'Running Operation...' : 'Start Operation'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}