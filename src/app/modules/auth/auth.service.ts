import AppError from '../../errorHelpers/AppError';
import { HTTP_STATUS_CODE } from '../../utils/HTTP_STATUS_CODE';

import {
  createNewAccessTokenByRefreshToken,
} from '../../utils/userTokens';
import { AuthProvider, IUser } from '../user/user.interface';
import { User } from '../user/user.models';


// const createAuth = async (payload: Partial<IUser>) => {
//   const { email, password } = payload;
//   if (!email || !password) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'Email and password are required',
//     );
//   }

//   const existingUser = await User.findByEmail(email!);
//   if (!existingUser) {
//     throw new AppError(httpStatus.NOT_FOUND, 'No user found with this email');
//   }

//   // Validate user status (verified, active, blocked, deleted)
//   validateUserStatus(existingUser);

//   const isPasswordValid = await existingUser.comparePassword(password!);
//   if (!isPasswordValid) {
//     throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
//   }

//   // Generate JWT token
//   const userTokens = createUserTokens(existingUser);

//   return {
//     accessToken: userTokens.accessToken,
//     refreshToken: userTokens.refreshToken,
//     user: existingUser,
//   };
// };

const getNewAccessTokenUsingRefreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError(
      HTTP_STATUS_CODE.BAD_REQUEST,
      'No refresh token recieved from cookies',
    );
  }

  const accessTokenInfo =
    await createNewAccessTokenByRefreshToken(refreshToken);

  return {
    accessToken: accessTokenInfo,
  };
};

const changePassword = async (
  payload: {
    oldPassword: string;
    newPassword: string;
  },
  userEmail: string,
) => {
  const { oldPassword, newPassword } = payload;
  const user = await User.findByEmail(userEmail);
  if (!user) {
    throw new AppError(HTTP_STATUS_CODE.NOT_FOUND, 'User not found');
  }

  const isOldPasswordMatch = await user.comparePassword(oldPassword);
  if (!isOldPasswordMatch) {
    throw new AppError(HTTP_STATUS_CODE.UNAUTHORIZED, 'Old Password does not match');
  }

  user.password = newPassword;

  await user.save();
  return;
};


export const authService = {
  getNewAccessTokenUsingRefreshToken,
  changePassword,
};
