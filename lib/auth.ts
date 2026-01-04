import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";

import prisma from "./db";
// If your Prisma file is located elsewhere, you can change the path
const resend = new Resend(process.env.RESEND_API_KEY);


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
    },
    plugins: [
        magicLink({
            sendMagicLink: async ({ email, url }) => {
                await resend.emails.send({
                    from: "onboarding@resend.dev",
                    to: email,
                    subject: "Your Magic Link",
                    html: `<a href="${url}">Click here to log in</a>`,
                });
            },
        }),
    ],
});
