import { ApiClient } from '../../services/apiClient.js';
import { ApiResponse } from '@bharatfarm/shared';
import { CropRoadmapRequest, CropRoadmapResponse } from './types.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isRoadmapResponse = (value: unknown): value is CropRoadmapResponse => {
  if (!isRecord(value) || !Array.isArray(value.roadmap)) {
    return false;
  }

  return value.roadmap.length > 0 &&
    value.roadmap.every(activity => isRecord(activity) &&
      typeof activity.day === 'number' &&
      typeof activity.date === 'string' &&
      typeof activity.stage === 'string' &&
      typeof activity.title === 'string' &&
      typeof activity.task === 'string' &&
      Array.isArray(activity.inputs) &&
      activity.inputs.every(input => typeof input === 'string'));
};

export const roadmapApi = {
  generateRoadmap: async (data: CropRoadmapRequest): Promise<ApiResponse<CropRoadmapResponse>> => {
    const response = await ApiClient.post<CropRoadmapResponse>('/roadmap/generate', data);

    if (response.success && !isRoadmapResponse(response.data)) {
      return {
        success: false,
        error: {
          code: 'INVALID_ROADMAP_RESPONSE',
          message: 'The AI service returned an incomplete roadmap. Please try again.'
        }
      };
    }

    return response;
  }
};
