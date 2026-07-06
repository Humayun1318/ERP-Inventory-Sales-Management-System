import AppError from '../../errorHelpers/AppError';
import { User } from './user.models';
import { AuthProvider, IUser, IUserUpdate } from './user.interface';
import { USER_SEARCHABLE_FIELDS, UserRole } from './user.constants';
import { QueryBuilder } from '../../builder/QueryBuilder';
import { HTTP_STATUS_CODE } from '../../utils/HTTP_STATUS_CODE';

const createUser = async (payload: IUser) => {
  const { email } = payload;

  // check if user already exists giving me with password field
  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    throw new AppError(
      HTTP_STATUS_CODE.CONFLICT,
      'User already exists with this email',
    );
  }

  // Normalize auths: set providerId to email
  payload.auths = payload?.auths?.map(() => ({
    provider: AuthProvider.LOCAL,
    providerId: email,
  })) || [
    {
      provider: AuthProvider.LOCAL,
      providerId: email,
    },
  ];

  // //check if CREDENTIALS provider exists
  const hasCredentialsProvider = payload.auths.some(
    (auth) => auth.provider === AuthProvider.LOCAL,
  );

  // local provider must have password
  if (hasCredentialsProvider && !payload.password) {
    throw new AppError(
      HTTP_STATUS_CODE.BAD_REQUEST,
      'Password is required for credentials authentication',
    );
  }

  // create user
  const user = await User.create(payload);
  return user;
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find({ isDeleted: false }), query);

  const usersQuery = queryBuilder
    .search(USER_SEARCHABLE_FIELDS)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [result, meta] = await Promise.all([
    usersQuery.build().lean(),
    queryBuilder.getMeta(),
  ]);

  return { result, meta };
};

const getSingleUser = async (
  targetId: string,
  requesterId: string,
  requesterRole: UserRole,
) => {
  if (requesterRole !== UserRole.ADMIN && requesterId !== targetId) {
    throw new AppError(
      HTTP_STATUS_CODE.FORBIDDEN,
      'You are not allowed to view this user',
    );
  }

  const user = await User.findOne({ _id: targetId, isDeleted: false }).lean();

  if (!user) {
    throw new AppError(HTTP_STATUS_CODE.NOT_FOUND, 'User not found');
  }

  return user;
};

const updateUser = async (
  targetId: string,
  requesterId: string,
  requesterRole: UserRole,
  payload: IUserUpdate,
) => {
  const user = await User.findOne({ _id: targetId, isDeleted: false });

  if (!user) {
    throw new AppError(HTTP_STATUS_CODE.NOT_FOUND, 'User not found');
  }

  const isSelf = requesterId === targetId;

  if (!isSelf && requesterRole !== UserRole.ADMIN) {
    throw new AppError(
      HTTP_STATUS_CODE.FORBIDDEN,
      'You are not allowed to update this user',
    );
  }

  // Only Admin can change role / isActive / isBlocked
  if (requesterRole !== UserRole.ADMIN) {
    delete payload.role;
    delete payload.isBlocked;
  }

  if (requesterRole == UserRole.ADMIN) {
    delete payload?.isVerified; // Admin cannot change isVerified status
    delete payload?.auths; // Admin cannot change auths
    delete payload?.password; // Admin cannot change password
    delete payload?.email; // Admin cannot change email
    delete payload?.name; // Admin cannot change name
  }

  Object.assign(user, payload);
  await user.save();

  return user;
};

const deleteUser = async (targetId: string) => {
  const user = await User.findOne({ _id: targetId, isDeleted: false });

  if (!user) {
    throw new AppError(HTTP_STATUS_CODE.NOT_FOUND, 'User not found');
  }

  user.isDeleted = true;
  await user.save();

  return null;
};

export const userService = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
