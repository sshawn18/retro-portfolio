import { NextResponse } from "next/server";
import { Resend } from "resend";
import { site } from "@/content/site";

// POST /api/contact
// Body: { name, fromEmail, subject, message }
export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email service not configured (RESEND_API_KEY missing)." },
      { status: 503 }
    );
  }

  let body: { name?: string; fromEmail?: string; subject?: string; message?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, fromEmail, subject, message } = body;

  if (!name?.trim() || !fromEmail?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Name, email and message are required." },
      { status: 422 }
    );
  }

  // Basic email format guard
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) {
    return NextResponse.json({ error: "Invalid sender email address." }, { status: 422 });
  }

  const resend = new Resend(apiKey);

  const emailSubject = subject?.trim()
    ? `[portfolio] ${subject.trim()}`
    : `[portfolio] Message from ${name.trim()}`;

  const html = `
    <p><strong>From:</strong> ${escHtml(name)} &lt;${escHtml(fromEmail)}&gt;</p>
    <p><strong>Subject:</strong> ${escHtml(emailSubject)}</p>
    <hr />
    <pre style="font-family:monospace;white-space:pre-wrap">${escHtml(message)}</pre>
    <hr />
    <p style="color:#888;font-size:12px">Sent via raviguptacc.vercel.app contact form</p>
  `;

  try {
    const { error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: site.email,
      replyTo: `${name.trim()} <${fromEmail.trim()}>`,
      subject: emailSubject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact send failed:", err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
