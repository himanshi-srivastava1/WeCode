import passport from '../config/passport.js';

export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      console.error("Google OAuth Error:", err);
      const frontendUrl = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',')[0] : 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }

    const token = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false }).then(() => {
      const frontendUrl = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',')[0] : 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/success?token=${token}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify({
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        fullName: user.fullName
      }))}`);
    }).catch(e => {
      console.error("Save Error:", e);
      const frontendUrl = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',')[0] : 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=server_error`);
    });
  })(req, res, next);
};

export const githubAuth = passport.authenticate('github', { scope: ['user:email'] });

export const githubCallback = (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, user, info) => {
    if (err || !user) {
      console.error("GitHub OAuth Error:", err);
      const frontendUrl = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',')[0] : 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }

    const token = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save().then(() => {
      const frontendUrl = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',')[0] : 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/success?token=${token}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify({
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        fullName: user.fullName
      }))}`);
    }).catch(e => {
      console.error("Save Error:", e);
      const frontendUrl = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',')[0] : 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=server_error`);
    });
  })(req, res, next);
};
