import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { magicLink, emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
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
