/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from 'passport-google-oauth20';
import { User } from '../modules/user/user.models';
import { envVars } from './env';
import { AuthProvider } from '../modules/user/user.interface';
import { UserRole } from '../modules/user/user.constants';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email: string, password: string, done) => {
      try {
        const user = await User.findByEmail(email);

        // ─────────────────────────────
        //  USER NOT FOUND
        // ─────────────────────────────
        if (!user) {
          return done(null, false, {
            message: 'User does not exist',
          });
        }

        // ─────────────────────────────
        // VERIFICATION CHECK
        // ─────────────────────────────
        // if (!user.isVerified) {
        //   return done(null, false, {
        //     message: 'User is not verified',
        //   });
        // }

        // ─────────────────────────────
        // STATUS CHECK (model method)
        // ─────────────────────────────
        if (!user.isLoginAllowed()) {
          return done(null, false, {
            message: `User is not allowed to login.`,
          });
        }

        // ─────────────────────────────
        //  GOOGLE + PASSWORD CONFLICT LOGIC
        // ─────────────────────────────
        const hasGoogleAuth = user.hasAuthProvider(AuthProvider.GOOGLE);

        if (hasGoogleAuth && !user.password) {
          return done(null, false, {
            message:
              'You registered with Google. Please login with Google first and set a password to enable credentials login.',
          });
        }

        // ─────────────────────────────
        // PASSWORD CHECK
        // ─────────────────────────────
        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
          return done(null, false, {
            message: 'Password does not match',
          });
        }

        await user.save();

        // ─────────────────────────────
        // SUCCESS
        // ─────────────────────────────
        return done(null, user);
      } catch (error) {
        console.log('Local Strategy Error:', error);
        return done(error);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        // SAFE STATE PARSE
        let state: any = {};

        if (req.query.state && typeof req.query.state === 'string') {
          try {
            state = JSON.parse(req.query.state);
          } catch {
            state = {};
          }
        }

        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false, {
            message: 'No email found',
          });
        }

        if (
          state &&
          state?.role &&
          ![UserRole.EMPLOYEE, UserRole.MANAGER].includes(state.role)
        ) {
          return done('Invalid role');
        }

        const role = state?.role || UserRole.EMPLOYEE;

        let user = await User.findByEmail(email);

        // ─────────────────────────────
        //  USER EXISTS
        // ─────────────────────────────
        if (user) {
          //  not verified user
          // if (!user.isVerified) {
          //   return done(null, false, {
          //     message: 'User is not verified',
          //   });
          // }

          //  inactive / blocked via model method
          if (!user.isLoginAllowed()) {
            return done(null, false, {
              message: `User is not allowed to login.`,
            });
          }

          // link google auth if not exists
          if (!user.hasAuthProvider(AuthProvider.GOOGLE)) {
            user.auths.push({
              provider: AuthProvider.GOOGLE,
              providerId: profile.id,
            });
          }

          // update login info
          await user.save();

          return done(null, user);
        }

        // ─────────────────────────────
        //  NEW USER
        // ─────────────────────────────
        const newUser = await User.create({
          email,
          name: profile.displayName || 'No Name',
          role,
          isVerified: true,
          auths: [
            {
              provider: AuthProvider.GOOGLE,
              providerId: profile.id,
            },
          ],
        });

        return done(null, newUser);
      } catch (error) {
        console.log('Google Strategy Error', error);
        return done(error);
      }
    },
  ),
);

// passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
//   done(null, user._id)
// })

// passport.deserializeUser(async (id: string, done: any) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user)
//   } catch (error) {
//     console.log(error);
//     done(error)
//   }
// })
