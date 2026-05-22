import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import crypto from 'crypto';
import { User } from '../models/user.models.js';

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/oauth/google/callback",
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      } else {
        // Check if user exists with same email
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        
        if (existingUser) {
          // Link Google account to existing user
          existingUser.googleId = profile.id;
          existingUser.avatar = profile.photos[0].value;
          await existingUser.save();
          return done(null, existingUser);
        }
        
        // Create new user
        user = new User({
          googleId: profile.id,
          username: (profile.displayName ? profile.displayName.replace(/\s+/g, '').toLowerCase() : profile.emails[0].value.split('@')[0]) + crypto.randomBytes(3).toString('hex'),
          email: profile.emails[0].value,
          fullName: profile.displayName,
          avatar: profile.photos[0].value,
          isEmailVerified: true
        });
        
        await user.save();
        return done(null, user);
      }
    } catch (error) {
      return done(error, null);
    }
  }
));



// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
