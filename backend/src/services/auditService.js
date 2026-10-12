import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  req,
  actor,
  action,
  targetType,
  targetId,
  details,
  metadata = {},
  amount = null,
  status = 'SUCCESS',
}) => {
  try {
    let actorData = actor;
    if (!actorData && req?.user) {
      actorData = {
        id: req.user._id,
        name: req.user.name || req.user.businessName || 'Administrator',
        role: req.user.role || 'admin',
        phone: req.user.phone || '',
        email: req.user.email || '',
      };
    } else if (!actorData) {
      actorData = { name: 'System', role: 'system' };
    }

    const ipAddress =
      req?.headers?.['x-forwarded-for'] ||
      req?.socket?.remoteAddress ||
      req?.ip ||
      '';

    const log = await AuditLog.create({
      actor: actorData,
      action,
      targetType,
      targetId: targetId ? String(targetId) : '',
      details,
      metadata,
      amount: amount !== null && amount !== undefined ? Number(amount) : null,
      status,
      ipAddress: String(ipAddress),
    });

    return log;
  } catch (err) {
    console.error('Audit log creation failed:', err.message);
    return null;
  }
};
