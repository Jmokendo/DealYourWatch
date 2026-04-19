import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(notification: EmailNotification) {
  try {
    const { data, error } = await getResend().emails.send({
      from: "DealYourWatch <notifications@dealyourwatch.com>",
      to: [notification.to],
      subject: notification.subject,
      html: notification.html,
    });

    if (error) {
      console.error("Email send error:", error);
      return false;
    }

    console.log("Email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}

export function createNewOfferEmail(
  recipientEmail: string,
  recipientName: string,
  offerAmount: string,
  currency: string,
  listingTitle: string,
  negotiationId: string
): EmailNotification {
  return {
    to: recipientEmail,
    subject: `Nueva oferta en ${listingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Nueva oferta recibida</h2>
        <p>Hola ${recipientName},</p>
        <p>Has recibido una nueva oferta por <strong>${offerAmount} ${currency}</strong> en tu listado:</p>
        <p><strong>${listingTitle}</strong></p>
        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <p><strong>Monto de la oferta:</strong> ${offerAmount} ${currency}</p>
        </div>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/negotiations/${negotiationId}"
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver negociación
          </a>
        </p>
        <p>Saludos,<br>El equipo de DealYourWatch</p>
      </div>
    `,
  };
}

export function createNewMessageEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  messageContent: string,
  threadId: string
): EmailNotification {
  return {
    to: recipientEmail,
    subject: `Nuevo mensaje de ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Nuevo mensaje</h2>
        <p>Hola ${recipientName},</p>
        <p>Has recibido un nuevo mensaje de <strong>${senderName}</strong>:</p>
        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #007bff;">
          <p style="margin: 0;">${messageContent}</p>
        </div>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/threads/${threadId}"
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver conversación
          </a>
        </p>
        <p>Saludos,<br>El equipo de DealYourWatch</p>
      </div>
    `,
  };
}

export function createOfferAcceptedEmail(
  recipientEmail: string,
  recipientName: string,
  offerAmount: string,
  currency: string,
  listingTitle: string,
  negotiationId: string
): EmailNotification {
  return {
    to: recipientEmail,
    subject: `¡Oferta aceptada! ${listingTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">¡Felicitaciones! Tu oferta fue aceptada</h2>
        <p>Hola ${recipientName},</p>
        <p>¡Excelente noticia! Tu oferta de <strong>${offerAmount} ${currency}</strong> por el reloj <strong>${listingTitle}</strong> ha sido aceptada.</p>
        <div style="background-color: #d4edda; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745;">
          <p><strong>Oferta aceptada:</strong> ${offerAmount} ${currency}</p>
          <p><strong>Reloj:</strong> ${listingTitle}</p>
        </div>
        <p>Ahora puedes proceder con los siguientes pasos para completar la transacción.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/negotiations/${negotiationId}"
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver detalles de la negociación
          </a>
        </p>
        <p>Saludos,<br>El equipo de DealYourWatch</p>
      </div>
    `,
  };
}