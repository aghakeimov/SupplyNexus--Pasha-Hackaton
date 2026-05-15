// Email service — opens default email client with pre-filled message
// Uses window.location.href for mailto: links (avoids popup blocker)

export function buildMailtoLink({ to, subject, body }) {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${to || ''}${params.length ? '?' + params.join('&') : ''}`;
}

export function sendPOEmail(po, supplier) {
  const subject = `Purchase Order ${po.id} — Bravo Supermarket`;
  const items = (po.items || []).map((it, i) => `  ${i+1}. ${it.name} — Qty: ${it.qty} ${it.unit || 'pcs'} x $${it.unitPrice}`).join('\n');
  const body = `Hormetli ${supplier?.contact || 'Techizatci'},\n\nBravo Supermarket zenciri adindan asagidaki sifarisi gonderirik:\n\nSifaris No: ${po.id}\nTarix: ${po.created}\nCatdirilma: ${po.delivery}\n\nMehsullar:\n${items}\n\nUmumi: $${(po.total || 0).toLocaleString()}\n\nZehmet olmasa, sifarisi tesdiqleyin.\n\nHormetle,\nBravo Procurement Team\nSupplyNexus ERP`;
  
  const link = buildMailtoLink({ to: supplier?.email || '', subject, body });
  window.location.href = link;
}

export function sendSOEmail(so, customer) {
  const subject = `Invoice ${so.id} — Bravo Supermarket`;
  const items = (so.items || []).map((it, i) => `  ${i+1}. ${it.name} — Qty: ${it.qty} x $${it.unitPrice} = $${it.total}`).join('\n');
  const body = `Hormetli ${customer?.contact || customer?.name || 'Musteri'},\n\nAsagidaki faktura gonderilir:\n\nFaktura No: ${so.id}\nTarix: ${so.date}\nCatdirilma: ${so.deliveryDate}\n\nMehsullar:\n${items}\n\nCem: $${(so.subtotal || 0).toLocaleString()}\nEndirim: -$${(so.discount || 0).toLocaleString()}\nVergi (18%): $${(so.tax || 0).toLocaleString()}\nUmumi: $${(so.total || 0).toLocaleString()}\n\nOdenis statusu: ${so.paymentStatus}\n\nHormetle,\nBravo Sales Team\nSupplyNexus ERP`;
  
  const link = buildMailtoLink({ to: customer?.email || '', subject, body });
  window.location.href = link;
}

export function sendChatEmail({ to, subject, message }) {
  const link = buildMailtoLink({ to, subject: subject || 'Message from Bravo — SupplyNexus', body: message });
  window.location.href = link;
}
