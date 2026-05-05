import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { type, subject, description, detailerName, detailerEmail, businessName } = await req.json();

    if (!subject || !description) {
      return NextResponse.json({ success: false, error: 'Subject and description are required.' }, { status: 400 });
    }

    const typeLabel = type === 'feature' ? 'Feature Request' : 'Bug Report';
    const typeColor = type === 'feature' ? '#7c3aed' : '#dc2626';
    const typeBg = type === 'feature' ? '#f5f3ff' : '#fef2f2';

    const html = `
      <div style="background:#f8fafc;padding:40px 0;font-family:'Segoe UI',Arial,sans-serif;">
        <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">
          <div style="background:#4f46e5;padding:24px 32px;">
            <div style="font-size:1.5rem;font-weight:700;color:#fff;margin:0;">Tap Detail</div>
            <div style="color:#c7d2fe;font-size:0.9rem;margin-top:4px;">Dashboard Feedback</div>
          </div>
          <div style="padding:32px;">
            <div style="display:inline-block;background:${typeBg};color:${typeColor};font-weight:600;font-size:0.8rem;padding:4px 12px;border-radius:999px;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:20px;">${typeLabel}</div>
            <div style="font-size:1.25rem;font-weight:600;color:#111827;margin-bottom:8px;">${subject}</div>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;color:#374151;font-size:0.95rem;line-height:1.6;white-space:pre-wrap;">${description}</div>
            <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
              <div style="font-size:0.85rem;color:#6b7280;margin-bottom:6px;"><strong style="color:#374151;">Detailer:</strong> ${detailerName || 'Unknown'}</div>
              ${businessName ? `<div style="font-size:0.85rem;color:#6b7280;margin-bottom:6px;"><strong style="color:#374151;">Business:</strong> ${businessName}</div>` : ''}
              ${detailerEmail ? `<div style="font-size:0.85rem;color:#6b7280;"><strong style="color:#374151;">Email:</strong> <a href="mailto:${detailerEmail}" style="color:#4f46e5;">${detailerEmail}</a></div>` : ''}
            </div>
          </div>
        </div>
        <div style="text-align:center;color:#94a3b8;font-size:0.8rem;margin-top:20px;">&copy; ${new Date().getFullYear()} Tap Detail</div>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: 'Tap Detail <noreply@tapdetail.com>',
      to: 'kevinhu91846@gmail.com',
      replyTo: detailerEmail || undefined,
      subject: `[${typeLabel}] ${subject}`,
      html,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
