import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Register Better Auth route handlers with CORS (required for SPA)
// SEC-012: Verify that the CORS implementation restricts Access-Control-Allow-Origin
// to your frontend origin(s) and does not reflect arbitrary origins.
// In production, ensure allowed origins are: your production domain + localhost for dev.
authComponent.registerRoutes(http, createAuth, { cors: true });

export default http;
