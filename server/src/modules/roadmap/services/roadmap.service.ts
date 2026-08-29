// ============================================================
// Crop Roadmap — Service Layer
// ============================================================

import { RoadmapRepository } from '../repositories/roadmap.repository.js';
import { CropRoadmapRequest, CropRoadmapResponse, CropRoadmapItem, RoadmapAdvisoryRequest } from '../types/roadmap.types.js';

export class RoadmapService {
  private repository: RoadmapRepository;

  constructor() {
    this.repository = new RoadmapRepository();
  }

  async listRoadmaps(userId: string): Promise<CropRoadmapItem[]> {
    return await this.repository.listRoadmaps(userId);
  }

  async getRoadmapById(id: string, userId: string): Promise<CropRoadmapItem | null> {
    return await this.repository.getRoadmapById(id, userId);
  }

  async generateRoadmap(request: CropRoadmapRequest, userId?: string): Promise<CropRoadmapResponse> {
    const normalizedRequest: CropRoadmapRequest = {
      ...request,
      crop: request.crop.trim(),
      state: request.state.trim(),
      district: request.district.trim(),
      soilType: request.soilType?.trim() || undefined,
      irrigation: request.irrigation?.trim() || undefined
    };

    return await this.repository.generateRoadmap(normalizedRequest, userId);
  }

  async updateProgress(id: string, userId: string, completedDays: number[]): Promise<boolean> {
    return await this.repository.updateProgress(id, userId, completedDays);
  }

  async deleteRoadmap(id: string, userId: string): Promise<boolean> {
    return await this.repository.deleteRoadmap(id, userId);
  }

  async getStageAdvisory(request: RoadmapAdvisoryRequest, userId?: string): Promise<{ advisory: string; weatherWarning?: string }> {
    return await this.repository.getStageAdvisory(request, userId);
  }
}
