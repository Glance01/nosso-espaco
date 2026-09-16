import { webhookLogs, transactions, subscribers } from '../../server/app.ts';

export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-netshop-signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  const signature = req.headers['x-netshop-signature'] || req.headers['authorization'];

  console.log('[Netshop Webhook Serverless]:', JSON.stringify(payload, null, 2));

  webhookLogs.unshift({
    receivedAt: new Date().toISOString(),
    signature,
    payload,
    headers: req.headers,
  });

  if (webhookLogs.length > 50) {
    webhookLogs.pop();
  }

  const ref = payload.reference || payload.ref || payload.transaction_reference;
  const status = payload.status || payload.event_type;

  if (ref && transactions.has(ref)) {
    const tx = transactions.get(ref)!;
    if (status === 'completed' || status === 'success' || status === 'PAID' || status === 'APPROVED') {
      tx.status = 'completed';
      tx.completedAt = new Date().toISOString();
      tx.log?.push({ timestamp: new Date().toISOString(), message: 'Webhook Netshop: Pagamento concluído com sucesso' });

      if (tx.phone) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);
        subscribers.set(tx.phone, { phone: tx.phone, expiresAt: expires.toISOString(), reference: ref });
      }
    } else if (status === 'failed' || status === 'rejected') {
      tx.status = 'failed';
      tx.log?.push({ timestamp: new Date().toISOString(), message: 'Webhook Netshop: Pagamento rejeitado ou falhado' });
    }
  }

  return res.status(200).json({ received: true, timestamp: new Date().toISOString() });
}
