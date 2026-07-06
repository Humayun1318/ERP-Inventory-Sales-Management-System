import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { dashboardService } from './dashboard.service';

const createDashboard = catchAsync(async (req: Request, res: Response) => {});
const getAllDashboard = catchAsync(async (req: Request, res: Response) => {});
const getDashboardById = catchAsync(async (req: Request, res: Response) => {});
const updateDashboard = catchAsync(async (req: Request, res: Response) => {});
const deleteDashboard = catchAsync(async (req: Request, res: Response) => {});

export const dashboardController = {
  createDashboard,
  getAllDashboard,
  getDashboardById,
  updateDashboard,
  deleteDashboard,
};