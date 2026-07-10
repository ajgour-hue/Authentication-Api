import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import morgan from "morgan";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { config } from "./config/config.js";
import helmet from "helmet";


const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// cors
app.use(cors({
  origin: config.CLIENT_URL, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));


// logger
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// body parser
app.use(express.urlencoded({ extended: true }));

// this is for testing the routes

// passport config 
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }

  )
);

// routes 
app.use(passport.initialize());
app.use("/api/auth", authRouter);



// default route for backend 
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});
 

export default app;