
import catchAsync from '../../utils/catchAsync';
import { HTTP_STATUS_CODE } from '../../utils/HTTP_STATUS_CODE';
import { sendResponse } from '../../utils/sendResponse';
import { dashboardService } from './dashboard.service';

const getSummary = catchAsync(async (req, res) => {
  const result = await dashboardService.getSummary();

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'Dashboard summary retrieved successfully',
    data: result,
  });
});

export const dashboardController = {
  getSummary,
};