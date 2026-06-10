import { baseEmailTemplate } from './base-email.template';

export const assignmentEmailTemplate = (
  equipmentName: string,
  assetTag: string,
  userName: string,
  event: 'ASSIGNED' | 'RETURNED',
  expectedReturnDate?: string,
) => {
  const title =
    event === 'ASSIGNED' ? 'Equipment Assigned' : 'Equipment Returned';
  const content = `
    <p>Hello ${userName},</p>
    <p>This is a notification regarding the following equipment:</p>
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom: 8px; font-size: 14px; color: #64748b;">Equipment</td>
          <td style="padding-bottom: 8px; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">${equipmentName}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 8px; font-size: 14px; color: #64748b;">Asset Tag</td>
          <td style="padding-bottom: 8px; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">${assetTag}</td>
        </tr>
        ${
          expectedReturnDate
            ? `
        <tr>
          <td style="padding-bottom: 8px; font-size: 14px; color: #64748b;">Expected Return</td>
          <td style="padding-bottom: 8px; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">${expectedReturnDate}</td>
        </tr>
        `
            : ''
        }
      </table>
    </div>
    <p>${
      event === 'ASSIGNED'
        ? 'Please ensure the equipment is handled with care and returned by the expected date.'
        : 'Thank you for returning the equipment. It has been checked back into the inventory.'
    }</p>
  `;

  return baseEmailTemplate({
    title,
    content,
    actionUrl: `${process.env.FRONTEND_URL}/modules/assignments`,
    actionText: 'View Assignments',
  });
};
