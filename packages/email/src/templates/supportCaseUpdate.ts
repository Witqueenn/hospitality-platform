export interface SupportCaseUpdateData {
  guestName: string;
  caseRef: string;
  status: string;
  message: string;
}

export function supportCaseUpdateHtml(data: SupportCaseUpdateData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Case Update</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a2e;">Support Case Update</h1>
  <p>Dear ${data.guestName},</p>
  <p>Your support case <strong>${data.caseRef}</strong> has been updated.</p>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Status:</strong> ${data.status}</p>
    <p>${data.message}</p>
  </div>
  <p>Thank you for your patience.</p>
</body>
</html>`;
}
