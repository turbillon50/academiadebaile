import { sendEmail } from "@/lib/resend";

export { sendEmail };

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
