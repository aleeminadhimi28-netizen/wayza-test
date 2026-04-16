import { PostHog } from "posthog-node";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.POSTHOG_API_KEY;
const host = process.env.POSTHOG_HOST || "https://us.i.posthog.com";

let phClient = null;

if (apiKey && apiKey !== "your_posthog_project_api_key_here") {
  phClient = new PostHog(apiKey, { host });
}

/**
 * Capture a server-side event in PostHog.
 * Fail silently if PostHog is not configured to prevent breaking the app.
 */
export const captureEvent = (distinctId, event, properties = {}) => {
  if (!phClient) return;

  try {
    phClient.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        $set: properties.userProfile || {},
        env: process.env.NODE_ENV || "development",
      },
    });
  } catch (err) {
    console.error("[PostHog] Event capture failed:", err.message);
  }
};

/**
 * Gracefully shut down PostHog client on process exit
 */
export const shutdownPostHog = async () => {
    if (phClient) {
        await phClient.shutdown();
    }
}
