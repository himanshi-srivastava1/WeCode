import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport.js";

const app = express();

app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors({
    origin: [
        "http://localhost:5173",
        ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : [])
    ],
    credentials: true,
    methods: ["GET", 'POST', "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
}));

app.use(passport.initialize());

import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import oauthRouter from "./routes/oauth.routes.js";
import profileRouter from "./routes/profile.routes.js";
import projectRouter from "./routes/project.routes.js";
import aiRouter from "./routes/ai.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/oauth", oauthRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/ai", aiRouter);

app.get('/', (req, res) => {
    res.send("HEllo world");
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || []
    });
});

export default app;