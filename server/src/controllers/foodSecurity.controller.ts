import { Request, Response, NextFunction } from 'express';
import { FoodSecurityEngine } from '../services/foodSecurity/foodSecurityEngine.js';

export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = (req.query.state as string) || 'West Bengal';
    const crop = (req.query.crop as string) || 'Paddy';
    const currentStock = req.query.currentStock ? parseFloat(req.query.currentStock as string) : 8.4;
    const expectedProduction = req.query.expectedProduction ? parseFloat(req.query.expectedProduction as string) : 11.2;
    const estimatedClimateLoss = req.query.estimatedClimateLoss ? parseFloat(req.query.estimatedClimateLoss as string) : 3.1;
    const committedOutwardSupply = req.query.committedOutwardSupply ? parseFloat(req.query.committedOutwardSupply as string) : 8.0;
    const safetyThreshold = req.query.safetyThreshold ? parseFloat(req.query.safetyThreshold as string) : 7.2;

    const snapshot = FoodSecurityEngine.calculateOverview(
      state,
      crop,
      currentStock,
      expectedProduction,
      estimatedClimateLoss,
      committedOutwardSupply,
      safetyThreshold
    );

    res.json({ success: true, data: snapshot });
  } catch (error) {
    next(error);
  }
};

export const getDistricts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = (req.query.state as string) || 'West Bengal';
    const districts = FoodSecurityEngine.getDistrictRiskBreakdown(state);
    res.json({ success: true, data: districts });
  } catch (error) {
    next(error);
  }
};

export const runScenario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = (req.body.state as string) || 'West Bengal';
    const crop = (req.body.crop as string) || 'Paddy';
    const cropLossPercentage = req.body.cropLossPercentage !== undefined ? parseFloat(req.body.cropLossPercentage) : 30;
    const baseStock = req.body.baseStock ? parseFloat(req.body.baseStock) : 8.4;
    const baseProduction = req.body.baseProduction ? parseFloat(req.body.baseProduction) : 11.2;
    const baseOutwardSupply = req.body.baseOutwardSupply ? parseFloat(req.body.baseOutwardSupply) : 8.0;
    const safetyThreshold = req.body.safetyThreshold ? parseFloat(req.body.safetyThreshold) : 7.2;

    const simulation = FoodSecurityEngine.simulateScenario({
      state,
      crop,
      cropLossPercentage,
      baseStock,
      baseProduction,
      baseOutwardSupply,
      safetyThreshold
    });

    res.json({ success: true, data: simulation });
  } catch (error) {
    next(error);
  }
};

export const getAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = [
      { id: 'fs-1', title: 'District Flood Crop Risk', severity: 'CRITICAL', district: 'Haldia', crop: 'Paddy', impact: 'Estimated 35% yield loss due to coastal storm surge.' },
      { id: 'fs-2', title: 'Regional Supply Buffer Margin Warning', severity: 'WARNING', district: 'State-wide WB', crop: 'Paddy', impact: 'Domestic availability margin is within 1.3 lakh tonnes of safety floor.' }
    ];
    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};
