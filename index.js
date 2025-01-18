const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const userRoutes = require('./routers/users');
const authRoutes = require('./routers/auth');
const vehicleRoutes = require('./routers/vehicle');
const serviceRoutes = require('./routers/service');
const requestRoutes = require('./routers/request');
const historyRoutes = require('./routers/history');
const dashboardRoutes = require('./routers/dashboard');

// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const { googleAuth } = require('./repositories/auth/index');

const port = process.env.PORT

app.use(bodyParser.json());

// Passport setup
// passport.use(
//     new GoogleStrategy(
//         {
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: '/api/auth/google/callback',
//         },
//         async (accessToken, refreshToken, profile, done) => {
//         try {
//             const user = await googleAuth(profile);
//             done(null, user);
//         } catch (err) {
//             done(err, null);
//         }
//         }
//     )
// );

// // Session handling for Passport
// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((user, done) => done(null, user));

const allowedOrigins = ['http://localhost:5173', 'https://car-maintenance-app.vercel.app', 'https://car-maintenance-app-git-dev-sonics-projects-ce6ca4bf.vercel.app'];

// CORS Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'],    // Allowed headers
  credentials: true                                     // Allow cookies or sessions
}));

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204); // No Content
});

// Routes
app.use('/api/auth', authRoutes);

app.use('/api', userRoutes)
app.use('/api', authRoutes)
app.use('/api', vehicleRoutes)
app.use('/api', serviceRoutes)
app.use('/api', requestRoutes)
app.use('/api', historyRoutes)
app.use('/api', dashboardRoutes)
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Successful!' });
});


app.listen(port, () => {
    console.log("Server is running on port 3000");
});