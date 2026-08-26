// ============================================================
// Crop Roadmap — Service Layer
// ============================================================

import { RoadmapRepository } from '../repositories/roadmap.repository.js';
import { CropRoadmapRequest, CropRoadmapResponse } from '../types/roadmap.types.js';

export class RoadmapService {
  private repository: RoadmapRepository;

  constructor() {
    this.repository = new RoadmapRepository();
  }

  async generateRoadmap(request: CropRoadmapRequest): Promise<CropRoadmapResponse> {
    // Normalize inputs before sending to repository
    const normalizedRequest: CropRoadmapRequest = {
      ...request,
      crop: request.crop.trim(),
      state: request.state.trim(),
      district: request.district.trim(),
      soilType: request.soilType?.trim() || undefined,
      irrigation: request.irrigation?.trim() || undefined
    };

    return await this.repository.generateRoadmap(normalizedRequest);
  }
}
