
import AppError from '../../errorHelpers/AppError';
import { HTTP_STATUS_CODE } from '../../utils/HTTP_STATUS_CODE';
import { IUser } from './user.interface';

export const validateUserStatus = (user: IUser) => {
  if (user.isDeleted) {
    throw new AppError(HTTP_STATUS_CODE.BAD_REQUEST, 'This user account no longer exists');
  }

  if (user.isBlocked) {
    throw new AppError(HTTP_STATUS_CODE.FORBIDDEN, 'This user account has been blocked');
  }

  if (!user.isActive) {
    throw new AppError(HTTP_STATUS_CODE.FORBIDDEN, 'This user account is not active');
  }

//   if (!user.isVerified) {
//     throw new AppError(HTTP_STATUS_CODE.FORBIDDEN, 'This user account is not verified');
//   }
};