import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User, IUser } from '../models/User.js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

// Serialize user for session
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as IUser)._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy (email/password)
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        if (!user.passwordHash) {
          return done(null, false, { message: 'Please login with Google' });
        }
        
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy (only if credentials are configured)
if (env.googleClientId && env.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl,
        scope: ['email', 'profile'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          
          if (!email) {
            return done(new Error('No email associated with Google account'));
          }
          
          // Check if user exists by googleId
          let user = await User.findOne({ googleId: profile.id });
          
          if (user) {
            return done(null, user);
          }
          
          // Check if user exists by email
          user = await User.findOne({ email: email.toLowerCase() });
          
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            if (!user.displayName && profile.displayName) {
              user.displayName = profile.displayName;
            }
            await user.save();
            return done(null, user);
          }
          
          // Create new user
          user = await User.create({
            email: email.toLowerCase(),
            googleId: profile.id,
            displayName: profile.displayName || email.split('@')[0],
          });
          
          logger.info(`New user created via Google OAuth: ${email}`);
          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
  logger.info('Google OAuth strategy configured');
} else {
  logger.warn('Google OAuth credentials not configured - Google login disabled');
}

export default passport;

