import { DriverApprovalStatus, ModerationActionType } from '#constants/trip'
import ModerationAction from '#models/moderation_action'

/**
 * Single notice for the member’s current driver gate (reject / revoke).
 * Not a moderation history — one derived row per relevant status.
 */
export type MemberDriverModerationNoticeDto = {
  kind: 'rejected' | 'revoked'
  message: string | null
}

const DISPLAY_REASON_MAX_LENGTH = 2000

/**
 * Picks the latest audited moderation `reason` for the action that matches the member’s
 * current driver approval state, then sanitizes it for safe UI display.
 */
export default class MemberDriverModerationNoticeService {
  async resolveForDriverStatus(
    targetUserId: number,
    driverApprovalStatus: string | null | undefined,
  ): Promise<MemberDriverModerationNoticeDto | null> {
    if (driverApprovalStatus === DriverApprovalStatus.REJECTED) {
      const row = await this.latestAction(targetUserId, ModerationActionType.DRIVER_REJECTED)
      return {
        kind: 'rejected',
        message: sanitizeMemberFacingModerationReason(row?.reason ?? null),
      }
    }

    if (driverApprovalStatus === DriverApprovalStatus.REVOKED) {
      const row = await this.latestAction(targetUserId, ModerationActionType.REVOKE_DRIVER)
      return {
        kind: 'revoked',
        message: sanitizeMemberFacingModerationReason(row?.reason ?? null),
      }
    }

    return null
  }

  private async latestAction(targetUserId: number, actionType: string) {
    return ModerationAction.query()
      .where('target_user_id', targetUserId)
      .where('action_type', actionType)
      .orderBy('created_at', 'desc')
      .first()
  }
}

/**
 * Plain text only: trim, normalize whitespace, strip controls, cap length.
 * Returns null if nothing worth showing (frontend keeps generic copy).
 */
export function sanitizeMemberFacingModerationReason(raw: string | null): string | null {
  if (raw == null) return null
  let s = raw.normalize('NFKC').trim()
  if (!s) return null

  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  s = s.replace(/\n+/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  if (!s) return null

  if (s.length > DISPLAY_REASON_MAX_LENGTH) {
    s = `${s.slice(0, DISPLAY_REASON_MAX_LENGTH).trimEnd()}…`
  }
  return s
}
