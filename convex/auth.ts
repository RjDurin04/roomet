/// <reference types="node" />
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { z } from "zod";
import authConfig from "./auth.config";

// @ts-expect-error - process is defined by Convex runtime
const siteUrl = process.env.SITE_URL!;

async function sendEmailJSEmail(templateId: string, templateParams: Record<string, string>) {
  const serviceId = process.env['EMAILJS_SERVICE_ID']!;
  const publicKey = process.env['EMAILJS_PUBLIC_KEY']!;
  const privateKey = process.env['EMAILJS_PRIVATE_KEY']!;

  if (!serviceId || !publicKey || !privateKey) {
    console.error("EmailJS environment variables are missing.");
    return;
  }

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send email via EmailJS:", errorText);
    }
  } catch (error) {
    console.error("Exception sending email via EmailJS:", error);
  }
}

// Component client for integrating Convex with Better Auth
export const authComponent = createClient<DataModel>(components.betterAuth);

const customSetPasswordPlugin = {
  id: "custom-set-password",
  endpoints: {
    setPasswordPatch: createAuthEndpoint("/set-password", {
      method: "POST",
      body: z.object({ newPassword: z.string().min(8) }),
      use: [sessionMiddleware]
    }, async (ctx) => {
      const { newPassword } = ctx.body;
      const session = ctx.context.session;
      if (!session) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
      }

      const passwordHash = await ctx.context.password.hash(newPassword);
      const accounts = await ctx.context.internalAdapter.findAccounts(session.user.id);
      
      const hasCredential = accounts.some((a: { providerId: string; password?: string }) => a.providerId === "credential" && a.password);
      if (hasCredential) {
        return new Response(JSON.stringify({ message: "Password already set" }), { status: 400 });
      }

      await ctx.context.internalAdapter.linkAccount({
        userId: session.user.id,
        providerId: "credential",
        accountId: session.user.id,
        password: passwordHash
      });
      
      return ctx.json({ status: true });
    })
  }
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: process.env['BETTER_AUTH_URL'] || siteUrl || "http://localhost:5173",
    trustedOrigins: [process.env['BETTER_AUTH_URL'] || siteUrl || "http://localhost:5173"],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      sendResetPassword: async ({ user, url }) => {
        const templateId = process.env['EMAILJS_TEMPLATE_ID_RESET']!;
        if (templateId) {
          await sendEmailJSEmail(templateId, {
            email: user.email,
            link: url,
          });
        }
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const templateId = process.env['EMAILJS_TEMPLATE_ID_VERIFY']!;
        if (templateId) {
          await sendEmailJSEmail(templateId, {
            name: user.name || "User",
            email: user.email,
            link: url,
          });
        }
      },
    },
    socialProviders: {
      google: {
        clientId: process.env['GOOGLE_CLIENT_ID']!,
        clientSecret: process.env['GOOGLE_CLIENT_SECRET']!,
      },
    },
    plugins: [
      // Custom patch for setPassword path
      customSetPasswordPlugin,
      // Required for client-side SPA frameworks
      crossDomain({ siteUrl }),
      // Required for Convex compatibility
      convex({ authConfig }),
    ],
  });
};

// Get the currently authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
