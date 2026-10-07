const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");

const envPath = path.join(__dirname, "..", ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const index = trimmed.indexOf("=");
  if (index > 0) {
    process.env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim();
  }
}

const to = "brianalan21@gmail.com";
const resend = new Resend(process.env.RESEND_API_KEY);

resend.emails
  .send({
    from: process.env.WAITLIST_FROM_EMAIL,
    to,
    subject: "Quanti waitlist test email",
    html: `
      <div style="margin:0;padding:32px;background-color:#0a0a0a;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
        <p style="color:#8b5cf6;letter-spacing:0.16em;">QUANTI WAITLIST</p>
        <h1 style="color:#ffffff;">You're in.</h1>
        <p>Welcome, ${to}.</p>
        <p style="font-size:28px;font-weight:700;">#42</p>
        <p style="color:#34d399;">IN RANGE FOR OG FOUNDER PASS</p>
        <p>Jump 50 spots for every 3 friends who join with your link.</p>
        <p><a href="https://quanti-app.com?ref=OGTEST" style="color:#8b5cf6;">https://quanti-app.com?ref=OGTEST</a></p>
        <p style="color:#71717a;font-size:12px;">© 2026 Quanti Technologies LLC · quanti-app.com</p>
      </div>
    `,
  })
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.error ? 1 : 0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
