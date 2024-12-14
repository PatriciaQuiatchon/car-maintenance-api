const express = require("express");
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

// Routes
app.use('/api/auth', authRoutes);

app.use('/api', userRoutes)
app.use('/api', authRoutes)

app.listen(port, () => {
    console.log("Server is running on port 3000");
});
