import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    status: 'operational',
    system: 'Opsora Z Telemetry Kernel',
    timestamp: new Date().toISOString(),
    version: '3.14.0-MODERNIST-PROD',
  });
}
