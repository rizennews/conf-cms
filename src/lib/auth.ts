import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { magicLink, emailOTP } from "better-auth/plugins";

const appURL = process.env.BETTER_AUTH_URL ?? "https://conf.lifecitych.org";

export const auth = betterAuth({
    baseURL: appURL,
    trustedOrigins: [
        appURL,
        "https://conf.lifecitych.org",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    advanced: {
        // Vercel sits in front of the app; honour x-forwarded-* so the
        // derived request origin matches the public host.
        trustedProxyHeaders: true,
    },
    database: drizzleAdapter(db, {
        provider: "pg", // Use Postgres adapter for Drizzle
    }),
    emailAndPassword: {  
        enabled: true,
    },
    plugins: [
        magicLink({
            sendMagicLink: async (data, request) => {
                // TODO: Wire this up to Resend or SendGrid to email the user
                console.log("Magic Link sent to:", data.email);
                console.log("URL:", data.url);
            }
        }),
        emailOTP({
            sendVerificationOTP: async (data, request) => {
                // TODO: Wire this up to Resend or SendGrid
                console.log("OTP sent to:", data.email);
                console.log("OTP Code:", data.otp);
            }
        })
    ]
});
