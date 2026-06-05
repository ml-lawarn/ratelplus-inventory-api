export const assignmentEmailTemplate = (equipmentName: string) => `
  <h2>Equipment Assigned</h2>

  <p>
    You have been assigned:
    <strong>${equipmentName}</strong>
  </p>

  <p>
    Please acknowledge receipt.
  </p>
`;
