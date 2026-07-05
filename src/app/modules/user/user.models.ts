import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { AuthProvider, IUser, IUserDocument, IUserModel } from './user.interface';
import { envVars } from '../../config/env';
import { UserRole } from './user.constants';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH ENTRY SUB-SCHEMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const authEntrySchema = new Schema(
  {
    provider: {
      type: String,
      enum: Object.values(AuthProvider),
      required: [true, 'Auth provider is required'],
    },
    providerId: {
      type: String,
      required: [true, 'Provider ID is required'],
      trim: true,
    },
  },
  { _id: false, versionKey: false },
);

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.EMPLOYEE },
    auths: {
      type: [authEntrySchema],
      required: [true, 'At least one auth provider is required'],
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

// ─────────────────────────────────────────────────────────────────────────────
// Pre-save hook — hash the password whenever it is set or modified.
// ─────────────────────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash when the password field has been touched.
  // Skipping unchanged passwords avoids re-hashing on every profile save.
  if (!this.isModified('password') || !this.password) return next();

  this.password = await bcrypt.hash(this.password, Number(envVars.BCRYPT_SALT_ROUND));
  next();
});

// Never leak password hash in responses
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Instance methods
// ─────────────────────────────────────────────────────────────────────────────
/**
 * comparePassword
 * Requires the document to have been fetched with .select('+password').
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * isLoginAllowed
 * A suspended or soft-deleted account must not be able to log in.
 */
userSchema.methods.isLoginAllowed = function (): boolean {
  return this.isActive === true && this.isBlocked === false && this.isDeleted === false;
};

/**
 *   user.hasAuthProvider(AuthProvider.LOCAL)  → password have or not
 *   user.hasAuthProvider(AuthProvider.GOOGLE) → Google linked or not
 */
userSchema.methods.hasAuthProvider = function (
  this: IUserDocument,
  provider: AuthProvider,
): boolean {
  return this.auths.some((entry) => entry.provider === provider);
};

// ─────────────────────────────────────────────────────────────────────────────
// Static methods
// ─────────────────────────────────────────────────────────────────────────────
userSchema.statics.findByEmail = function (email: string): Promise<IUserDocument | null> {
  return this.findOne({ email: email.toLowerCase().trim() }).select('+password');
};

userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: string,
): Promise<boolean> {
  const query: Record<string, unknown> = {
    email: email.toLowerCase().trim(),
  };
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }
  const user = await this.findOne(query).select('_id');
  return !!user;
};

export const User = model<IUserDocument, IUserModel>('User', userSchema);