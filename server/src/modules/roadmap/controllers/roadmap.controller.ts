// ============================================================
// Crop Roadmap — Controller
// ============================================================

import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware.js';
import { RoadmapService } from '../services/roadmap.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { logger } from '../../../utils/logger.js';

export class RoadmapController {
  private service: RoadmapService;

  constructor() {
    this.service = new RoadmapService();
  }

  handleList = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id || 'demo-user';
      const roadmaps = await this.service.listRoadmaps(userId);
      ApiResponse.success(res, roadmaps, 'Roadmaps retrieved successfully');
    } catch (err) {
      logger.error('[RoadmapController] List error:', err);
      ApiResponse.error(res, 'Failed to fetch roadmaps', 'FETCH_ERROR', 500);
    }
  };

  handleGetById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id || 'demo-user';
      const { id } = req.params;
      const roadmap = await this.service.getRoadmapById(id, userId);

      if (!roadmap) {
        ApiResponse.error(res, 'Roadmap not found or access denied', 'NOT_FOUND', 404);
        return;
      }

      ApiResponse.success(res, roadmap, 'Roadmap retrieved successfully');
    } catch (err) {
      logger.error('[RoadmapController] GetById error:', err);
      ApiResponse.error(res, 'Failed to fetch roadmap details', 'FETCH_ERROR', 500);
    }
  };

  handleGenerate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const roadmap = await this.service.generateRoadmap(req.body, userId);
      ApiResponse.success(res, roadmap, 'Crop roadmap generated successfully');
    } catch (err) {
      const cause = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[RoadmapController] Generate request failed', { error: cause });
      ApiResponse.error(res, 'Unable to generate crop roadmap. Please try again.', 'AI_ERROR', 500);
    }
  };

  handleUpdateProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ApiResponse.error(res, 'Authentication required', 'UNAUTHORIZED', 401);
        return;
      }

      const { id } = req.params;
      const { completedDays } = req.body;

      if (!Array.isArray(completedDays)) {
        ApiResponse.error(res, 'completedDays must be an array of numbers', 'INVALID_INPUT', 400);
        return;
      }

      const updated = await this.service.updateProgress(id, userId, completedDays);
      if (!updated) {
        ApiResponse.error(res, 'Failed to update progress or unauthorized', 'UPDATE_FAILED', 400);
        return;
      }

      ApiResponse.success(res, { id, completedDays }, 'Roadmap progress saved');
    } catch (err) {
      logger.error('[RoadmapController] Progress update failed:', err);
      ApiResponse.error(res, 'Failed to save roadmap progress', 'UPDATE_ERROR', 500);
    }
  };

  handleDelete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        ApiResponse.error(res, 'Authentication required', 'UNAUTHORIZED', 401);
        return;
      }

      const { id } = req.params;
      const deleted = await this.service.deleteRoadmap(id, userId);

      if (!deleted) {
        ApiResponse.error(res, 'Failed to delete roadmap or unauthorized', 'DELETE_FAILED', 400);
        return;
      }

      ApiResponse.success(res, { id }, 'Roadmap deleted successfully');
    } catch (err) {
      logger.error('[RoadmapController] Delete failed:', err);
      ApiResponse.error(res, 'Failed to delete roadmap', 'DELETE_ERROR', 500);
    }
  };

  handleAdvisory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const result = await this.service.getStageAdvisory(req.body, userId);
      ApiResponse.success(res, result, 'Stage advisory generated');
    } catch (err) {
      logger.error('[RoadmapController] Advisory failed:', err);
      ApiResponse.error(res, 'Failed to generate stage advisory', 'ADVISORY_ERROR', 500);
    }
  };
}
