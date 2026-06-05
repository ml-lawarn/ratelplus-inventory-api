export const maintenanceEmailTemplate = (equipmentName: string) => `
  <h2>Maintenance Notification</h2>

  <p>
    Maintenance has been scheduled for
    <strong>${equipmentName}</strong>.
  </p>
`;
