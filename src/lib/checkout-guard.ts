import "server-only";
import { integrations } from "./env";
import type { CurrentUser } from "./auth";

/** Why this member can't check out yet, or null if they can. */
export function checkoutBlocker(user: CurrentUser): string | null {
  if (integrations.email() && !user.emailVerifiedAt)
    return "Please confirm your email address before checking out. We sent you a link; you can send a new one from My account.";
  return null;
}
