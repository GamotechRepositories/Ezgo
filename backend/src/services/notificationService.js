import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendEmail } from './emailService.js';

/**
 * Dispatch an in-app notification and email to a user
 */
export const notifyUser = async ({
  userId,
  title,
  message,
  type = 'SYSTEM',
  link = '',
  metadata = {},
  sendMail = true,
}) => {
  try {
    if (!userId) return null;

    // Create in-app record
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      link,
      metadata,
    });

    // Send email if user has email address
    if (sendMail) {
      const user = await User.findById(userId).select('name email');
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: `EzzyGo: ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #f95724; margin-bottom: 8px;">EzzyGo Update</h2>
              <h3 style="margin-top: 0;">${title}</h3>
              <p style="font-size: 15px; line-height: 1.5;">${message}</p>
              ${
                link
                  ? `<a href="${link}" style="display: inline-block; padding: 10px 18px; background-color: #f95724; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 12px;">View Details</a>`
                  : ''
              }
              <hr style="margin-top: 24px; border: none; border-top: 1px solid #e2e8f0;" />
              <p style="font-size: 12px; color: #64748b;">EzzyGo Event Services Marketplace</p>
            </div>
          `,
        });
      }
    }

    return notification;
  } catch (error) {
    console.error('Failed to dispatch notification:', error?.message);
    return null;
  }
};
