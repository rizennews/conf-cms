import { auth } from "../../../../lib/auth";
import { nextCookies } from "better-auth/next-js";

// Catch all route for /api/auth/*
export const GET = auth.handler;
export const POST = auth.handler;
