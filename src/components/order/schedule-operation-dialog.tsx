// src/components/order/schedule-operation-dialog.tsx
"use client";

import { useState } from "react";
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
  SCHEDULE_ENDPOINT: '/api/schedule',
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

  const validateForm = (): boolean => {
    if (formData.endTime <= formData.startTime) {
      setError('End time must be after start time');
      return false;
    }
    if (formData.timeCompute <= 0) {
      setError('Time compute must be greater than 0');
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

    console.log('Starting schedule operation...');
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
          message: steps[stepIndex],
          progress: 0,
          status: 'running'
        }));

        // Simulate step progress
        await simulateProgress(stepIndex, formData.timeCompute * 1000 / steps.length);

        // If it's the computation step, make the actual API call
        if (stepIndex === 1) {
          try {
            console.log('Sending request to:', API_CONFIG.SCHEDULE_ENDPOINT);
            const apiPayload = {
                startTime: formData.startTime.toISOString(),
                endTime: formData.endTime.toISOString(),
                timeCompute: formData.timeCompute,
                description: formData.description,
                operationType: 'schedule',
                requestedBy: 'user',
                timestamp: new Date().toISOString()
            };

            
            console.log('Payload:', apiPayload);

            
            // Make the POST request using configured endpoint
            const response = await axios.post(
                API_CONFIG.SCHEDULE_ENDPOINT,
                apiPayload,
                {
                    headers: API_CONFIG.HEADERS,
                    timeout: API_CONFIG.TIMEOUT,
                    withCredentials: true
                }
            );
            
            console.log('API Response:', response.data);
            setResult(response.data);
          } catch (apiError: any) {
            throw new Error(apiError.response?.data?.message || 'API call failed');
          }
        }
      }

      // Complete
      setProgress({
        step: steps.length,
        message: 'Schedule operation completed successfully!',
        progress: 100,
        status: 'completed',
        startedAt: progress.startedAt,
        completedAt: new Date()
      });

    } catch (err: any) {
      console.error('Schedule operation failed:', err);
      setError(err.message || 'Failed to run schedule operation');
      setProgress(prev => ({
        ...prev,
        status: 'error',
        message: 'Operation failed'
      }));
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
        onClose={handleClose}
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <PlayIcon size={24} />
            <Typography variant="h6">Schedule Operation</Typography>
            <Chip
              icon={getStatusIcon(progress.status)}
              label={progress.status.toUpperCase()}
              color={getStatusColor(progress.status) as any}
              size="small"
            />
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Form Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Operation Parameters
              </Typography>
              
              <Grid container spacing={2}>
                

                <Grid item xs={12}>
                  <TextField
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
            disabled={isRunning || progress.status === 'completed'}
            startIcon={isRunning ? <CircularProgress size={16} /> : <PlayIcon size={16} />}
          >
            {isRunning ? 'Running Operation...' : 'Start Operation'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}