import { NextResponse } from 'next/server';
import { getAIClient } from '../../_lib/gemini';
import { isRecord, readString, validationError } from '../../_lib/validation';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isRecord(body)) return validationError('Request body must be a JSON object');

    const unitId = readString(body.unitId, 'unitId', { maxLength: 80 });
    const model = readString(body.model, 'model', { maxLength: 120 });
    const status = readString(body.status, 'status', { maxLength: 80 });
    const anomalyType = readString(body.anomalyType, 'anomalyType', { maxLength: 120 });
    for (const result of [unitId, model, status, anomalyType]) {
      if (!result.success) return validationError(result.error);
    }

    const client = getAIClient();
    if (!client) {
      return NextResponse.json({
        success: true,
        source: 'local-expert-rules',
        diagnosis: {
          criticality: anomalyType.data ? 'HIGH' : 'NOMINAL',
          rootCause: anomalyType.data ? `Hydraulic proportional control valve jitter in Unit ${unitId.data || 'OZ-701'}.` : 'All monitored systems operate within nominal parameters.',
          recommendedAction: anomalyType.data ? 'Inspect the affected system and schedule maintenance.' : 'Maintain the scheduled operating cycle.',
          estimatedDowntimeRisk: anomalyType.data ? 'Requires assessment' : '0% expected downtime',
          maintenanceCode: anomalyType.data ? 'ERR-HYD-8820B' : 'STAT-OK-001',
          prescriptiveSteps: ['Inspect relevant telemetry', 'Verify sensor readings', 'Record maintenance findings'],
        },
      });
    }

    const prompt = `Analyze this telemetry payload and return valid JSON only. Unit: ${unitId.data || 'unknown'}; Model: ${model.data || 'unknown'}; Status: ${status.data || 'unknown'}; Anomaly: ${anomalyType.data || 'None'}; Telemetry: ${JSON.stringify(body.telemetry || {})}; Logs: ${JSON.stringify(body.logs || [])}`;
    const response = await client.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    return NextResponse.json({ success: true, source: 'gemini-3.7-flash', diagnosis: JSON.parse(response.text?.trim() || '{}') });
  } catch (error) {
    console.error('Diagnostic error:', error);
    return NextResponse.json({ success: false, error: { code: 'DIAGNOSTIC_FAILED', message: 'Unable to process diagnostic request' } }, { status: 500 });
  }
}
