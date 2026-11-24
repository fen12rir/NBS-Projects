import nodemailer from "nodemailer";

export interface EmailResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure =
    process.env.SMTP_SECURE === "true" ||
    process.env.SMTP_SECURE === "1" ||
    port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function getFromAddress(): string {
  return (
    process.env.SMTP_FROM ||
    `"National Book Store POS Training" <${process.env.SMTP_USER || "noreply@nbs.com.ph"}>`
  );
}

function getPortalLoginUrl(): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "");
  return base ? `${base}/login` : "";
}

export async function sendAccountApprovalEmail(params: {
  to: string;
  fullName: string;
  branchName?: string;
  accessDays?: number | null;
  isUnlimited?: boolean;
}): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    console.info(
      `[Email] SMTP not configured. Skipping approval email to ${params.to}.`
    );
    return { sent: false, skipped: true };
  }

  try {
    const transporter = createTransporter();
    const loginUrl = getPortalLoginUrl();
    const accessLabel = params.isUnlimited
      ? "Unlimited access"
      : `${params.accessDays || 30} days`;

    const subject = "Approved: Your NBS POS Training Account is Ready";
    const text = [
      `Hello ${params.fullName},`,
      "",
      "Good news! Your National Book Store POS Training Portal account has been APPROVED by your administrator.",
      "",
      `Branch: ${params.branchName || "National Book Store"}`,
      `Training Access Duration: ${accessLabel}`,
      "",
      loginUrl
        ? `You can now sign in and start your cashier training modules here:\n${loginUrl}`
        : "You can now sign in to the NBS POS Training Portal using your registered email and password to start your cashier training modules.",
      "",
      "Best regards,",
      "National Book Store POS Training Team",
    ].join("\n");

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; padding: 20px 24px; display: flex; align-items: center;">
          <span style="background: #E4002B; color: #ffffff; font-weight: 800; font-size: 18px; padding: 4px 10px; letter-spacing: -0.5px; display: inline-block; margin-right: 12px;">NBS</span>
          <span style="color: #ffffff; font-weight: 700; font-size: 15px;">POS Training Portal</span>
        </div>
        <div style="padding: 24px;">
          <div style="display: inline-block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; margin-bottom: 14px;">
            Account Approved
          </div>
          <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #0f172a;">Welcome, ${params.fullName}!</h2>
          <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
            Your National Book Store Cashier POS Training account has been <strong>approved</strong>. You can now sign in to complete your training modules and practice on the POS simulator.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; font-size: 13px; color: #334155;">
            <div style="margin-bottom: 6px;"><strong>Assigned Branch:</strong> ${params.branchName || "National Book Store"}</div>
            <div><strong>Training Access:</strong> ${accessLabel}</div>
          </div>
          ${
            loginUrl
              ? `<div style="margin-bottom: 20px;">
                  <a href="${loginUrl}" style="display: inline-block; background: #E4002B; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 11px 22px; border-radius: 8px;">
                    Sign In to Training Portal
                  </a>
                </div>`
              : ""
          }
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            Use the email address and password you created during sign-up.
          </p>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; font-size: 11px; color: #64748b;">
          National Book Store • Cashier POS Training &amp; Practice Portal
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: getFromAddress(),
      to: params.to,
      subject,
      text,
      html,
    });

    return { sent: true };
  } catch (err: any) {
    console.error("[Email] Failed to send approval email:", err?.message || err);
    return { sent: false, error: err?.message || "Email send failed" };
  }
}

export async function sendPosCredentialsEmail(params: {
  to: string;
  fullName: string;
  branchCode: string;
  branchName?: string;
  posUsername: string;
  posPassword: string;
}): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    console.info(
      `[Email] SMTP not configured. Skipping POS credentials email to ${params.to}.`
    );
    return { sent: false, skipped: true };
  }

  try {
    const transporter = createTransporter();
    const base = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "");
    const simulatorUrl = base ? `${base}/simulator` : "";
    const storeDisplay = params.branchName
      ? `${params.branchCode} (${params.branchName})`
      : params.branchCode;

    const subject = "POS Simulator Credentials: Your Unique NBS Terminal Login";
    const text = [
      `Hello ${params.fullName},`,
      "",
      "Here are your unique POS Terminal Simulator login credentials. Use these whenever the NBS POS Simulator displays the green USER LOGIN screen:",
      "",
      `POS UserName (Clerk ID): ${params.posUsername}`,
      `POS Password: ${params.posPassword}`,
      "",
      "Terminal Header Details:",
      `- Clerk Name: ${params.fullName}`,
      `- Store No. (Str No.): ${storeDisplay}`,
      `- Register No. (Reg No.): 0004`,
      "",
      simulatorUrl
        ? `Open the POS Terminal Simulator:\n${simulatorUrl}`
        : "Sign in to the NBS POS Training Portal and launch any practice lesson or the Practical Exam to use your POS terminal credentials.",
      "",
      "Keep these credentials handy for your Lesson 2-2 Sign-On practice and the Final Practical Certification Exam.",
      "",
      "Best regards,",
      "National Book Store POS Training Team",
    ].join("\n");

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; padding: 20px 24px; display: flex; align-items: center;">
          <span style="background: #E4002B; color: #ffffff; font-weight: 800; font-size: 18px; padding: 4px 10px; letter-spacing: -0.5px; display: inline-block; margin-right: 12px;">NBS</span>
          <span style="color: #ffffff; font-weight: 700; font-size: 15px;">POS Terminal Simulator Credentials</span>
        </div>
        <div style="padding: 24px;">
          <div style="display: inline-block; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; margin-bottom: 14px;">
            POS Terminal Access
          </div>
          <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #0f172a;">Your Unique POS Register Login</h2>
          <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
            Hello <strong>${params.fullName}</strong>, use the credentials below whenever you sign on to the <strong>USER LOGIN</strong> screen inside the NBS POS Simulator (including Lesson 2-2 and the Practical Exam):
          </p>
          <div style="background: #1e293b; color: #f8fafc; border-radius: 10px; padding: 18px 20px; margin-bottom: 18px; font-family: 'Courier New', Courier, monospace;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 10px;">
              POS USER LOGIN CREDENTIALS
            </div>
            <div style="margin-bottom: 8px; font-size: 15px;">
              <span style="color: #94a3b8;">UserName:</span>
              <strong style="color: #4ade80; font-size: 18px; margin-left: 8px;">${params.posUsername}</strong>
            </div>
            <div style="font-size: 15px;">
              <span style="color: #94a3b8;">Password:</span>
              <strong style="color: #facc15; font-size: 18px; margin-left: 8px;">${params.posPassword}</strong>
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; font-size: 13px; color: #334155;">
            <div style="font-weight: 700; margin-bottom: 8px; color: #0f172a;">Assigned POS Terminal Header Data:</div>
            <div style="margin-bottom: 4px;"><strong>Clerk:</strong> ${params.fullName}</div>
            <div style="margin-bottom: 4px;"><strong>Str No.:</strong> ${storeDisplay}</div>
            <div><strong>Reg No.:</strong> 0004</div>
          </div>
          ${
            simulatorUrl
              ? `<div style="margin-bottom: 18px;">
                  <a href="${simulatorUrl}" style="display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 11px 22px; border-radius: 8px;">
                    Launch POS Terminal Simulator
                  </a>
                </div>`
              : ""
          }
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            Note: Your Portal Sign-In uses your registered email and password. The POS UserName and Password above are specifically for the cash register login screen inside the simulator.
          </p>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; font-size: 11px; color: #64748b;">
          National Book Store • Cashier POS Training &amp; Practice Portal
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: getFromAddress(),
      to: params.to,
      subject,
      text,
      html,
    });

    return { sent: true };
  } catch (err: any) {
    console.error("[Email] Failed to send POS credentials email:", err?.message || err);
    return { sent: false, error: err?.message || "Email send failed" };
  }
}

export async function sendAccountRejectionEmail(params: {
  to: string;
  fullName: string;
  branchName?: string;
  reason?: string;
}): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    console.info(
      `[Email] SMTP not configured. Skipping rejection email to ${params.to}.`
    );
    return { sent: false, skipped: true };
  }

  try {
    const transporter = createTransporter();
    const reasonText =
      params.reason?.trim() || "Registration declined by administrator.";

    const subject = "Update on Your NBS POS Training Account Registration";
    const text = [
      `Hello ${params.fullName},`,
      "",
      "We regret to inform you that your National Book Store POS Training Portal registration was not approved at this time.",
      "",
      `Branch: ${params.branchName || "National Book Store"}`,
      `Reason: ${reasonText}`,
      "",
      "If you believe this was a mistake or need assistance, please coordinate with your branch supervisor or store manager.",
      "",
      "Best regards,",
      "National Book Store POS Training Team",
    ].join("\n");

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; padding: 20px 24px; display: flex; align-items: center;">
          <span style="background: #E4002B; color: #ffffff; font-weight: 800; font-size: 18px; padding: 4px 10px; letter-spacing: -0.5px; display: inline-block; margin-right: 12px;">NBS</span>
          <span style="color: #ffffff; font-weight: 700; font-size: 15px;">POS Training Portal</span>
        </div>
        <div style="padding: 24px;">
          <div style="display: inline-block; background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; margin-bottom: 14px;">
            Registration Declined
          </div>
          <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #0f172a;">Hello, ${params.fullName}</h2>
          <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #334155;">
            Your registration for the National Book Store Cashier POS Training Portal was not approved at this time.
          </p>
          <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; font-size: 13px; color: #881337;">
            <div style="margin-bottom: 6px;"><strong>Branch:</strong> ${params.branchName || "National Book Store"}</div>
            <div><strong>Reason:</strong> ${reasonText}</div>
          </div>
          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #475569;">
            Please contact your branch supervisor or store manager if you need clarification or wish to re-apply.
          </p>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; font-size: 11px; color: #64748b;">
          National Book Store • Cashier POS Training &amp; Practice Portal
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: getFromAddress(),
      to: params.to,
      subject,
      text,
      html,
    });

    return { sent: true };
  } catch (err: any) {
    console.error("[Email] Failed to send rejection email:", err?.message || err);
    return { sent: false, error: err?.message || "Email send failed" };
  }
}
