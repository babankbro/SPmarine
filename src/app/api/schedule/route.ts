// src/app/api/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API_URL = 'http://62.72.30.12:19002/orders';

export async function POST(request: NextRequest) {
  try {
    console.log('Proxy: Received request to /api/schedule');
    
    const body = await request.json();
    console.log('Proxy: Request body:', body);

    // Forward the request to Python Flask API
    console.log('Proxy: Forwarding to Python API at:', PYTHON_API_URL);
    
    const response = await fetch(PYTHON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Proxy: Python API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Proxy: Python API error response:', errorText);
      
      return NextResponse.json(
        { 
          error: 'Python API error', 
          details: errorText,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Proxy: Python API success response:', data);
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Proxy: Error occurred:', error);
    
    return NextResponse.json(
      { 
        error: 'Proxy server error', 
        details: error.message,
        type: error.name,
        code: error.code
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET(request: NextRequest) {
  try {
    console.log('Proxy: GET request to /api/schedule');
    
    const response = await fetch(PYTHON_API_URL.replace('/orders', '/health'), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Python API not available', status: response.status },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      message: 'Proxy is working',
      pythonApiStatus: data,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Cannot connect to Python API',
        details: error.message,
        pythonApiUrl: PYTHON_API_URL
      },
      { status: 502 }
    );
  }
}