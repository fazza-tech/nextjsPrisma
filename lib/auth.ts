import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
// If your Prisma file is located elsewhere, you can change the path



export const auth = betterAuth({
    baseURL: "http://localhost:3200",

    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: ["http://localhost:3200"],


    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            overrideUserInfoOnSignIn: true,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            overrideUserInfoOnSignIn: true,
        },
    },
    accountLinking: {
        enabled: true,
    }
});