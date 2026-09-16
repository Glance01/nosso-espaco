import { transactions, subscribers } from '../../server/app.ts';

export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  const { reference } = body;

  const tx = transactions.get(reference);
  if (!tx) {
    return res.status(404).json({ success: false, message: 'Transação não encontrada' });
  }

  tx.status = 'completed';
  tx.completedAt = new Date().toISOString();
  tx.log?.push({ timestamp: new Date().toISOString(), message: 'Pagamento confirmado e subscrição premium ativada.' });

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  if (tx.phone) {
    subscribers.set(tx.phone, { phone: tx.phone, expiresAt: expires.toISOString(), reference });
  }

  return res.status(200).json({
    success: true,
    status: 'completed',
    transaction: tx,
    expiresAt: expires.toISOString(),
  });
}
