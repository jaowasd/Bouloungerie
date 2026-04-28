const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

async function verifyConnection() {
  try {
    await transporter.verify();
    console.log('[Email] SMTP conectado.');
  } catch (e) {
    console.warn('[Email] SMTP falhou:', e.message);
    console.warn('[Email] Verifique SMTP_USER e SMTP_PASS no .env');
  }
}

function base(content) {
  return `<!DOCTYPE html><html lang="pt"><head><meta charset="UTF-8">
<style>
body{margin:0;background:#0a0a0a;font-family:Arial,sans-serif;color:#fff}
.w{max-width:560px;margin:0 auto;background:#0d0d0d;border:1px solid rgba(255,255,255,.07)}
.h{padding:1.5rem;border-bottom:2px solid #c8a84b;text-align:center;font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,.4)}
.h em{font-style:normal;color:#c8a84b}
.b{padding:2rem}
.t{font-size:1.3rem;font-weight:300;margin-bottom:1rem}
.p{font-size:13px;color:rgba(255,255,255,.6);line-height:1.8;margin-bottom:1rem}
.cb{text-align:center;background:#0a0a0a;border:1px solid rgba(200,168,75,.4);padding:2rem;margin:1.5rem 0}
.code{font-size:2.5rem;font-weight:700;letter-spacing:10px;color:#c8a84b;font-family:monospace}
.exp{font-size:11px;color:rgba(255,255,255,.3);margin-top:.5rem;text-transform:uppercase}
.div{height:1px;background:rgba(255,255,255,.06);margin:1rem 0}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px}
.rl{color:rgba(255,255,255,.4)}.rv{color:#fff;font-weight:500}
.tot{display:flex;justify-content:space-between;padding:1rem 0}
.tl{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.4)}
.tv{font-size:1.4rem;font-weight:300;color:#c8a84b}
.al{background:rgba(231,76,60,.08);border:1px solid rgba(231,76,60,.3);padding:.75rem;font-size:12px;color:#e74c3c;margin-top:1rem}
.ft{padding:1.5rem;text-align:center;border-top:1px solid rgba(255,255,255,.05);font-size:10px;color:rgba(255,255,255,.2);line-height:1.8}
</style></head><body>
<div class="w">
  <div class="h">Boulangerie <em>Turbo</em></div>
  <div class="b">${content}</div>
  <div class="ft">Boulangerie Turbo — Porto Alegre, RS<br>(51) 99810-0017 · joaogabrielperugini@gmail.com<br>E-mail automatico. Nao responda.</div>
</div></body></html>`;
}

async function sendOTP(email, code, min) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM, to: email,
    subject: `${code} — Seu codigo de acesso | Boulangerie Turbo`,
    html: base(`
      <p class="t">Seu codigo de acesso</p>
      <p class="p">Use o codigo abaixo para entrar na Boulangerie Turbo.</p>
      <div class="cb"><div class="code">${code}</div><div class="exp">Expira em ${min} minutos</div></div>
      <p class="p">Se nao solicitou este codigo, ignore este e-mail.</p>
      <div class="al">Nunca compartilhe este codigo com ninguem.</div>`),
  });
}

async function sendOrderNotification(o) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM, to: process.env.OWNER_EMAIL, replyTo: o.clientEmail,
    subject: `[Pedido] ${o.clientName} — ${o.total} | Boulangerie Turbo`,
    html: base(`
      <p class="t">Novo pedido recebido!</p>
      <div class="div"></div>
      <div class="row"><span class="rl">Cliente</span><span class="rv">${o.clientName}</span></div>
      <div class="row"><span class="rl">E-mail</span><span class="rv">${o.clientEmail}</span></div>
      <div class="div"></div>
      <div class="row"><span class="rl">Modelo</span><span class="rv">${o.modelo||'—'}</span></div>
      <div class="row"><span class="rl">Recheio</span><span class="rv">${o.recheio||'—'}</span></div>
      <div class="row"><span class="rl">Cobertura</span><span class="rv">${o.cobertura||'—'}</span></div>
      <div class="row"><span class="rl">Camadas</span><span class="rv">${o.camadas||'—'}</span></div>
      <div class="row"><span class="rl">Cor</span><span class="rv">${o.cor||'—'}</span></div>
      ${o.notes ? `<div class="row"><span class="rl">Obs.</span><span class="rv">${o.notes}</span></div>` : ''}
      <div class="div"></div>
      <div class="tot"><span class="tl">Total estimado</span><span class="tv">${o.total}</span></div>
      <p class="p" style="margin-top:1rem">Entre em contato para confirmar entrega.</p>`),
  });
}

async function sendOrderConfirmation(o) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM, to: o.clientEmail,
    subject: `Pedido confirmado! | Boulangerie Turbo`,
    html: base(`
      <p class="t">Pedido confirmado, ${o.clientName}!</p>
      <p class="p">Recebemos sua encomenda. Entraremos em contato para confirmar os detalhes e o prazo de entrega.</p>
      <div class="div"></div>
      <div class="row"><span class="rl">Modelo</span><span class="rv">${o.modelo||'Personalizado'}</span></div>
      <div class="div"></div>
      <div class="tot"><span class="tl">Total estimado</span><span class="tv">${o.total}</span></div>
      <p class="p" style="margin-top:1.5rem"><strong style="color:#c8a84b">(51) 99810-0017</strong> — WhatsApp disponivel</p>`),
  });
}

module.exports = { verifyConnection, sendOTP, sendOrderNotification, sendOrderConfirmation };
