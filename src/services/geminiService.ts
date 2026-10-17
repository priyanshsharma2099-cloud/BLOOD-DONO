import { BloodGroup, BloodComponent, ConditionCategory } from '../types';

export interface DraftMessageParams {
  bloodGroup: BloodGroup | string;
  component: BloodComponent;
  unitsRequested: number;
  hospitalName: string;
  city?: string;
  urgency?: string;
  conditionCategory?: ConditionCategory;
  conditionNote?: string;
}

export interface DraftMessageResult {
  message: string;
  isAiGenerated: boolean;
  provider: 'gemini' | 'template_fallback';
  model?: string;
}

export async function generateDonorMessage(
  params: DraftMessageParams
): Promise<DraftMessageResult> {
  const componentLabel = params.component.replace('_', ' ').toUpperCase();
  const fallbackMessage = `Urgent request for ${params.bloodGroup} ${componentLabel} (${params.unitsRequested} unit${
    params.unitsRequested > 1 ? 's' : ''
  }) near ${params.hospitalName}. If you are a consenting registered donor willing to help, please respond through LifeLink AI. Real eligibility and donation will be verified by the authorized transfusion center.`;

  try {
    const response = await fetch('/api/gemini/draft-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return {
      message: data.message || fallbackMessage,
      isAiGenerated: data.isAiGenerated ?? false,
      provider: data.provider || 'template_fallback',
      model: data.model,
    };
  } catch {
    return {
      message: fallbackMessage,
      isAiGenerated: false,
      provider: 'template_fallback',
    };
  }
}
