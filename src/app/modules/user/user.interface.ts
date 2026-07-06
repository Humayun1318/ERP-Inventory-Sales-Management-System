import { Document, Model, Types } from 'mongoose';
import { UserRole } from './user.constants';

// authProvider types
export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

// authentication providers
export interface IAuthEntry {
  provider: AuthProvider;
  providerId: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  auths: IAuthEntry[];
  isVerified: boolean;
  isActive: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IUserUpdate = Partial<IUser>;

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;

  comparePassword(candidatePassword: string): Promise<boolean>;
  isLoginAllowed(): boolean;
  hasAuthProvider(provider: AuthProvider): boolean;
}

// ---------------------------------------------------------------------------
// Static methods on the Model constructor.
// Defined here so TypeScript can resolve them when called as User.findByEmail().
// ---------------------------------------------------------------------------
export interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
  isEmailTaken(email: string, excludeUserId?: Types.ObjectId): Promise<boolean>;
}
