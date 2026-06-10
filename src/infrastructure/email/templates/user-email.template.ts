import { baseEmailTemplate } from './base-email.template';

export const userEmailTemplate = (
  userName: string,
  event: 'CREATED' | 'ACTIVATED' | 'DEACTIVATED',
) => {
  let title = '';
  let content = '';
  let actionText = '';

  switch (event) {
    case 'CREATED':
      title = 'Welcome to RatelPlus';
      content = `
        <p>Hello ${userName},</p>
        <p>Your account has been successfully created in the RatelPlus Inventory Management System.</p>
        <p>You can now log in using your employee code and the password provided by your administrator.</p>
      `;
      actionText = 'Log In Now';
      break;
    case 'ACTIVATED':
      title = 'Account Activated';
      content = `
        <p>Hello ${userName},</p>
        <p>Your RatelPlus account has been activated. You now have full access to the system based on your assigned role.</p>
      `;
      actionText = 'Access System';
      break;
    case 'DEACTIVATED':
      title = 'Account Deactivated';
      content = `
        <p>Hello ${userName},</p>
        <p>Your RatelPlus account has been deactivated. You will no longer be able to access the system.</p>
        <p>If you believe this is an error, please contact your department head or system administrator.</p>
      `;
      break;
  }

  return baseEmailTemplate({
    title,
    content,
    actionUrl: event !== 'DEACTIVATED' ? process.env.FRONTEND_URL : undefined,
    actionText,
  });
};
