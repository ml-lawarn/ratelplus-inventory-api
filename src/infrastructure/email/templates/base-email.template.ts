// /src/infrastructure/email/templates/base-email.template.ts
export interface BaseEmailOptions {
  title: string;
  preheader?: string;
  content: string;
  actionUrl?: string;
  actionText?: string;
}

export const baseEmailTemplate = (options: BaseEmailOptions) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${options.preheader ? `<title>${options.preheader}</title>` : ''}
  <style>
    @import url('https://googleapis.com');
    
    /* Global Reset & Base Styling */
    body { 
      margin: 0; 
      padding: 0; 
      width: 100% !important; 
      background-color: #f8fafc; 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Email Wrapper Box */
    .container { 
      max-width: 600px; 
      margin: 40px auto; 
      background-color: #ffffff; 
      border-radius: 24px; 
      overflow: hidden; 
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
      border: 1px solid rgba(226, 232, 240, 0.8);
    }
    
    /* Immersive Cover Header */
    .cover-image { 
      width: 100%; 
      height: auto; 
      display: block; 
    }
    
    /* Structural Content Body */
    .content { 
      padding: 48px 40px; 
      color: #334155; 
    }
    
    /* Modern, Tech-Forward Headers */
    .title { 
      color: #0f172a; 
      font-size: 26px; 
      font-weight: 700; 
      margin: 0 0 24px 0; 
      letter-spacing: -0.5px;
    }
    
    /* Generic Dynamic Text Elements */
    .body-text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 24px 0;
    }
    
    /* Futuristic Action Button */
    .button-container {
      text-align: center;
      margin: 32px 0 12px 0;
    }
    .button { 
      display: inline-block; 
      padding: 14px 32px; 
      background-color: #123b73; 
      color: #ffffff !important; 
      text-decoration: none; 
      border-radius: 12px; 
      font-weight: 600; 
      font-size: 15px;
      letter-spacing: -0.1px;
      box-shadow: 0 4px 12px rgba(18, 59, 115, 0.2);
      transition: all 0.2s ease;
    }
    
    /* Sleek Structural Divider */
    .divider { 
      height: 1px; 
      background-color: #f1f5f9; 
      margin: 40px 0 24px 0; 
    }
    
    /* System Disclaimer Note */
    .system-note {
      font-size: 13px; 
      line-height: 1.5;
      color: #94a3b8;
      margin: 0;
    }
    
    /* Professional Corporate Footer */
    .footer { 
      padding: 0 40px 48px 40px; 
      background-color: #ffffff; 
      text-align: center; 
      color: #94a3b8; 
      font-size: 12px; 
      line-height: 1.6;
    }
    .footer-highlight {
      color: #64748b;
      font-weight: 500;
      margin-bottom: 6px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Clean Structural Header without logo duplication -->
    <img src="cid:ratel-cover-image" alt="RatelPlus Banner" class="cover-image">

    <div class="content">
      <h1 class="title">${options.title}</h1>
      
      <!-- Injected HTML template layout/cards pass through here cleanly -->
      <div class="body-text">
        ${options.content}
      </div>
      
      ${
        options.actionUrl
          ? `
        <div class="button-container">
          <a href="${options.actionUrl}" class="button">${options.actionText || 'View Details'}</a>
        </div>
      `
          : ''
      }
      
      <div class="divider"></div>
      <p class="system-note">
        This is an automated notification from the RatelPlus Inventory Management System. 
        If you have any questions, please contact your systems administrator.
      </p>
    </div>

    <div class="footer">
      <p class="footer-highlight">&copy; ${new Date().getFullYear()} RatelPlus NIG LTD. All rights reserved.</p>
      <p style="margin: 0; padding: 0 10px;">
        Plots 375 and 373, 8th Avenue by 7th Avenue, Zawachiki Layout, Behind 1000 Housing Estate, adjacent to Dala Inland Container Terminal. P. O. Box 4466 Kano, Nigeria.
      </p>
    </div>
  </div>
</body>
</html>
`;
