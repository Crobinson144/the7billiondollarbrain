import { afterEach, describe, expect, it, vi } from "vitest";

const load = async () => { vi.resetModules(); return import("../src/lib/env"); };

describe("env", () => {
  afterEach(() => { vi.unstubAllEnvs(); });

  it("treats blank values as not set", async () => {
    vi.stubEnv("APP_URL", "   ");
    vi.stubEnv("EMAIL_FROM", "");
    vi.stubEnv("NEXT_PUBLIC_TAWK_WIDGET_ID", "");
    vi.stubEnv("RESEND_API_KEY", " ");
    const { env, publicEnv, integrations } = await load();
    expect(env.appUrl).toBe("http://localhost:3000");
    expect(env.emailFrom).toContain("info@the7billiondollarbrain.com");
    expect(publicEnv.tawkWidgetId).toBe("default");
    expect(integrations.email()).toBe(false);
  });

  it("uses and trims real values", async () => {
    vi.stubEnv("APP_URL", " https://example.com/ ");
    vi.stubEnv("BUSINESS_GOVERNING_STATE", "Michigan");
    const { env, business } = await load();
    expect(env.appUrl).toBe("https://example.com");
    expect(business.governingState).toBe("Michigan");
    expect(business.legalName).toBe("The 7 Billion Dollar Brain");
  });
});
