import { baseEmailTemplate } from './base-email.template';

export const maintenanceEmailTemplate = (
  equipmentName: string,
  assetTag: string,
  event: 'SCHEDULED' | 'STARTED' | 'COMPLETED' | 'CANCELLED',
  date?: string,
) => {
  let title = '';
  let statusText = '';
  
  switch (event) {
    case 'SCHEDULED':
      title = 'Maintenance Scheduled';
      statusText = `scheduled for ${date || 'a future date'}`;
      break;
    case 'STARTED':
      title = 'Maintenance Started';
      statusText = 'now in progress';
      break;
    case 'COMPLETED':
      title = 'Maintenance Completed';
      statusText = 'successfully completed';
      break;
    case 'CANCELLED':
      title = 'Maintenance Cancelled';
      statusText = 'cancelled';
      break;
  }

  const content = `
    <p>This is a notification regarding the maintenance of:</p>
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
      <p style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">${equipmentName}</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Asset Tag: ${assetTag}</p>
    </div>
    <p>The maintenance record for this asset is ${statusText}.</p>
  `;

  return baseEmailTemplate({
    title,
    content,
    actionUrl: `${process.env.FRONTEND_URL}/inventory`,
    actionText: 'Track Asset',
  });
};
