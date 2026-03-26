import {
  getActiveUserIdHeader,
  getOptionalDevUserIdHeader,
  isSessionLoginActive,
  resolveActiveUserId,
  resolveDevIdentityHeader,
  type ActiveUserIdSource,
  type DevIdentitySource,
} from "@/lib/auth/active-user-id";

export {
  getActiveUserIdHeader,
  getOptionalDevUserIdHeader,
  isSessionLoginActive,
  resolveActiveUserId,
  resolveDevIdentityHeader,
  type ActiveUserIdSource,
  type DevIdentitySource,
};

/**
 * @deprecated Same as `getActiveUserIdHeader` (optional dev `X-User-Id` only).
 */
export function getDevUserIdHeader(): string {
  return getActiveUserIdHeader();
}
