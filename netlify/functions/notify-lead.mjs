// Fires automatically when a Netlify Form submission is verified (not spam).
// Sends an instant push notification to the ntfy app on your phone, with a
// one-tap "Call" button. Configure in Netlify: Site configuration → Environment
// variables → NTFY_TOPIC = your secret topic name (see memory-bank/leads-notifications.md).
//
// Optional: NTFY_SERVER (default https://ntfy.sh) if you self-host ntfy later.

const SERVER = process.env.NTFY_SERVER || 'https://ntfy.sh';

function digits(s = '') { return String(s).replace(/[^\d]/g, ''); }

export default {
  async formSubmitted(event) {
    const topic = process.env.NTFY_TOPIC;
    if (!topic) { console.warn('NTFY_TOPIC not set, skipping push'); return; }

    const d = event.data || {};
    const name    = d.name    || 'Someone';
    const phone   = d.phone   || '';
    const email   = d.email   || '';
    const service = d.service || 'Not specified';
    const plan    = d.plan    || '';
    const message = d.message || '';
    const tel     = digits(phone);
    const telUrl  = tel ? `tel:${tel.length === 10 ? '+1' + tel : '+' + tel}` : null;

    const lines = [
      `📞 ${phone || 'no phone'}${email ? `  ✉ ${email}` : ''}`,
      `Service: ${service}`,
      plan ? plan : null,
      message && !message.startsWith('Winter plan:') ? `"${message.slice(0, 300)}"` : null,
    ].filter(Boolean);

    const actions = [];
    if (telUrl) actions.push({ action: 'view', label: 'Call now', url: telUrl, clear: true });
    if (tel)    actions.push({ action: 'view', label: 'Text back', url: `sms:${telUrl.slice(4)}` });
    if (email)  actions.push({ action: 'view', label: 'Email', url: `mailto:${email}` });

    const body = {
      topic,
      title: `New estimate request — ${name}`,
      message: lines.join('\n'),
      priority: 5,            // max → bypasses Do Not Disturb if you allow it in the app
      tags: ['leaves', 'moneybag'],
      click: 'https://app.netlify.com/projects/zillions-42926-v1/forms',
      actions: actions.slice(0, 3),
    };

    const res = await fetch(SERVER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    console.log(`ntfy → ${res.status} for ${name}`);
  },
};
