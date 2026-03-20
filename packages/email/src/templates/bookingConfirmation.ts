export interface BookingConfirmationData {
  guestName: string;
  hotelName: string;
  bookingRef: string;
  checkIn: string;
  checkOut: string;
  totalCents: number;
  currency: string;
}

export function bookingConfirmationHtml(data: BookingConfirmationData): string {
  const total = (data.totalCents / 100).toFixed(2);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Booking Confirmation</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1a1a2e;">Booking Confirmed!</h1>
  <p>Dear ${data.guestName},</p>
  <p>Your reservation at <strong>${data.hotelName}</strong> has been confirmed.</p>

  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin: 0 0 16px;">Booking Details</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; color: #666;">Reference</td><td style="font-weight: bold;">${data.bookingRef}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Check-in</td><td>${data.checkIn}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Check-out</td><td>${data.checkOut}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Total</td><td style="font-weight: bold;">${data.currency} ${total}</td></tr>
    </table>
  </div>

  <p>We look forward to welcoming you!</p>
  <p>The ${data.hotelName} Team</p>
</body>
</html>`;
}
