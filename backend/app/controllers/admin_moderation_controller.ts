import AdminModerationService from '#services/admin_moderation_service'
import { adminOptionalReasonValidator } from '#validators/admin_optional_reason_validator'
import type { HttpContext } from '@adonisjs/core/http'

const adminModerationService = new AdminModerationService()

export default class AdminModerationController {
  async dashboard({ serialize }: HttpContext) {
    const dashboard = await adminModerationService.dashboard()
    return serialize({ dashboard })
  }

  async users({ serialize }: HttpContext) {
    const users = await adminModerationService.listUsers()
    return serialize({ users })
  }

  async reports({ serialize }: HttpContext) {
    const reports = await adminModerationService.listReports()
    return serialize({ reports })
  }

  async suspendUser({ currentUser, params, request, serialize }: HttpContext) {
    const targetUserId = Number(params.id)
    const payload = await request.validateUsing(adminOptionalReasonValidator)
    const result = await adminModerationService.suspendUser(
      currentUser.id,
      targetUserId,
      payload.reason
    )
    return serialize({ result })
  }

  async revokeDriver({ currentUser, params, request, serialize }: HttpContext) {
    const targetUserId = Number(params.id)
    const payload = await request.validateUsing(adminOptionalReasonValidator)
    const result = await adminModerationService.revokeDriver(
      currentUser.id,
      targetUserId,
      payload.reason
    )
    return serialize({ result })
  }

  async approveDriver({ currentUser, params, request, serialize }: HttpContext) {
    const targetUserId = Number(params.id)
    const payload = await request.validateUsing(adminOptionalReasonValidator)
    const result = await adminModerationService.approveDriver(
      currentUser.id,
      targetUserId,
      payload.reason
    )
    return serialize({ result })
  }

  async rejectDriver({ currentUser, params, request, serialize }: HttpContext) {
    const targetUserId = Number(params.id)
    const payload = await request.validateUsing(adminOptionalReasonValidator)
    const result = await adminModerationService.rejectDriver(
      currentUser.id,
      targetUserId,
      payload.reason
    )
    return serialize({ result })
  }
}
