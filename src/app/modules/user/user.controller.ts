import { JwtPayload } from 'jsonwebtoken';

import { sendResponse } from '../../utils/sendResponse';
import { getUserIdFromReq } from '../../utils/getUserIdFromReq';
import { userService } from './user.service';
import catchAsync from '../../utils/catchAsync';
import { HTTP_STATUS_CODE } from '../../utils/HTTP_STATUS_CODE';
import { UserRole } from './user.constants';

const createUser = catchAsync(async (req, res) => {
  const result = await userService.createUser(req.body);

  // Send success response to client with created user data
  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.CREATED,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const userId = getUserIdFromReq(req);
  const result = await userService.getMe(userId);

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const { result, meta } = await userService.getAllUsers(
    req.query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: { meta, result }, // flag: adjust if your sendResponse supports top-level meta
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const requesterId = getUserIdFromReq(req);
  const requesterRole = (req.user as JwtPayload).role as UserRole;

  const result = await userService.getSingleUser(
    req.params.id as string,
    requesterId,
    requesterRole,
  );

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const requesterId = getUserIdFromReq(req);
  const requesterRole = (req.user as JwtPayload).role as UserRole;

  const result = await userService.updateUser(
    req.params.id as string,
    requesterId,
    requesterRole,
    req.body,
  );

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id as string);

  sendResponse(res, {
    statusCode: HTTP_STATUS_CODE.OK,
    success: true,
    message: 'User deleted successfully',
    data: null,
  });
});

export const userController = {
  createUser,
  getMe,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
