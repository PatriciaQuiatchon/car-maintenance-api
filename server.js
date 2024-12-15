const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const userRoutes = require('./routers/users');
const authRoutes = require('./routers/auth');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { googleAuth } = require('./controllers/auth/index');

const port = process.env.PORT

app.use(bodyParser.json());

// Passport setup
passport.use(
    new GoogleStrategy(
        {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await googleAuth(profile);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
        }
    )
);

// Session handling for Passport
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));


const allowedOrigins = ['http://localhost:5173', 'http://yourfrontend.com'];

app.use(cors({
  origin: function(origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Routes
app.use('/api/auth', authRoutes);

app.use('/api', userRoutes)
app.use('/api', authRoutes)

app.listen(port, () => {
    console.log("Server is running on port 3000");
});
