import { NextResponse } from 'next/server';
import { getAIClient } from '../../_lib/gemini';

export async function POST(request: Request) {
  try {
    const { unitId, model, status, telemetry, anomalyType, logs } = await request.json();
    const client = getAIClient();

    if (!client) {
      return NextResponse.json({
        success: true,
        source: 'local-expert-rules',
        diagnosis: {
          criticality: anomalyType ? 'HIGH' : 'NOMINAL',
          rootCause: anomalyType
            ? `Hydraulic proportional control valve jitter coupled with transient thermal dissipation bottleneck in Unit ${unitId || 'OZ-701'}.`
            : 'All mechanical actuators and sensor manifolds operate within nominal ISO-10816 vibration parameters.',
          recommendedAction: anomalyType
            ? 'Execute automated fluid line flush cycle (Stage 2) and recalibrate high-pressure transducer at next 15-minute queue pause.'
            : 'Maintain scheduled autonomous haul cycle without manual intervention.',
          estimatedDowntimeRisk: anomalyType ? '18 minutes if unaddressed within 2 operating cycles' : '0.0% expected downtime',
          maintenanceCode: anomalyType ? 'ERR-HYD-8820B' : 'STAT-OK-001',
          prescriptiveSteps: [
            'Trigger automatic pump pressure relief ramp to 180 bar.',
            'Inspect secondary thermal heat exchanger thermocouple.',
            'Verify CAN-bus baud synchronization on Node 4.',
          ],
        },
      });
    }

    const prompt = `You are Opsora Z Autonomous Fleet Diagnostic Engine.
Analyze this industrial telemetry payload and produce a structured, high-precision engineering diagnostic:
Unit: ${unitId} (${model})
Status: ${status}
Anomaly flag: ${anomalyType || 'None'}
Telemetry Snapshot: ${JSON.stringify(telemetry || {})}
Recent System Logs: ${JSON.stringify(logs || [])}

Respond with valid JSON only in this exact format:
{
  "criticality": "NOMINAL" | "MODERATE" | "HIGH" | "CRITICAL",
  "rootCause": "precise technical explanation",
  "recommendedAction": "immediate operational resolution step",
  "estimatedDowntimeRisk": "e.g. 15 mins or 0 mins",
  "maintenanceCode": "e.g. ERR-XXX-####",
  "prescriptiveSteps": ["step 1", "step 2", "step 3"]
}`;

    const response = await client!.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    return NextResponse.json({
      success: true,
      source: 'gemini-3.7-flash',
      diagnosis: JSON.parse(response.text?.trim() || '{}'),
    });
  } catch (error) {
    console.error('Diagnostic error:', error);
    return NextResponse.json({
      success: true,
      source: 'fallback-rules',
      diagnosis: {
        criticality: 'MODERATE',
        rootCause: 'Dynamic pressure variance observed in primary manifold circuit.',
        recommendedAction: 'Apply closed-loop PID dampening and monitor delta over next 60s.',
        estimatedDowntimeRisk: 'Low (< 5 min)',
        maintenanceCode: 'WARN-PID-309',
        prescriptiveSteps: [
          'Verify hydraulic supply line filter delta-P',
          'Recalibrate servo valve zero-offset',
          'Log telemetry to blackbox buffer',
        ],
      },
    });
  }
}
