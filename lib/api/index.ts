export {
  ApiConfigurationError,
  ApiError,
  ApiNetworkError,
  apiFetch,
  apiGetJson,
  apiPatchJson,
  apiPostJson,
  assertApiConfigured,
  checkApiHealth,
  getApiBaseUrl,
  unwrapData,
} from "./client";
export { applyApiAuthHeaders } from "./auth-headers";
export {
  getActiveUserIdHeader,
  getDevUserIdHeader,
  getOptionalDevUserIdHeader,
  isSessionLoginActive,
  resolveActiveUserId,
  resolveDevIdentityHeader,
} from "./dev-identity";
export {
  describeApiFailure,
  getApiFailurePhase,
  isApiConfigurationError,
  isApiError,
  isApiNetworkError,
} from "./errors";
export type { ApiFailurePhase } from "./errors";
export type { ApiResult } from "./types";
