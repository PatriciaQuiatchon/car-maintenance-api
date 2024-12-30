const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const userRoutes = require('./routers/users');
const authRoutes = require('./routers/auth');
const vehicleRoutes = require('./routers/vehicle');
const serviceRoutes = require('./routers/service');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { googleAuth } = require('./repositories/auth/index');

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


const allowedOrigins = ['http://localhost:5173', 'https://car-maintenance-app.vercel.app'];

// CORS Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (e.g., mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Add allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'],    // Add allowed headers if needed
  credentials: true                                     // If you need to handle cookies or sessions
}));

// Handle preflight request (OPTIONS method)
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// Routes
app.use('/api/auth', authRoutes);

app.use('/api', userRoutes)
app.use('/api', authRoutes)
app.use('/api', vehicleRoutes)
app.use('/api', serviceRoutes)

app.listen(port, () => {
    console.log("Server is running on port 3000");
});
