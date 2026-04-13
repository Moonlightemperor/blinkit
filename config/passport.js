var GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const { User } = require("../Models/user");

const appBaseUrl =
  process.env.APP_BASE_URL ||
  process.env.BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

const googleCallbackUrl =
  process.env.GOOGLE_CALLBACK_URL ||
  (appBaseUrl ? `${appBaseUrl}/auth/google/callback` : "") ||
  "http://localhost:3000/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: googleCallbackUrl,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
          });

          await user.save();
          
        }
        cb(null, user);
      } catch (err) {
        cb(err, null);
      }
    },
  ),
);

passport.serializeUser(function(user,cb){
  return cb(null , user._id);
})

passport.deserializeUser(async function (id, cb){
  let user = await User.findOne({_id:id});
  cb(null,user)
})

module.exports = passport;