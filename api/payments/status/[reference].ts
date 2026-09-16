import { netshop } from '../../../server/netshop.ts';
import { transactions, subscribers } from '../../../server/app.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const reference = (req.query?.reference || req.params?.reference) as string;
  if (!reference) {
    return res.status(400).json({ success: false, message: 'Referência não informada' });
  }

  const tx = transactions.get(reference);
  if (!tx) {
    return res.status(200).json({
      success: true,
      status: 'pending',
      transaction: { reference, status: 'pending' },
    });
  }

  if (tx.status === 'processing' || tx.status === 'pending') {
    const statusCheck = await netshop.checkPaymentStatus(tx.netshopId || reference);
    if (statusCheck.status === 'completed' || statusCheck.status === 'success') {
      tx.status = 'completed';
      tx.completedAt = new Date().toISOString();
      if (tx.phone) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 30);
        subscribers.set(tx.phone, { phone: tx.phone, expiresAt: expires.toISOString(), reference });
      }
    } else if (statusCheck.status === 'failed') {
      tx.status = 'failed';
      tx.log?.push({ timestamp: new Date().toISOString(), message: statusCheck.message });
    }
  }

  return res.status(200).json({
    success: true,
    status: tx.status,
    message: tx.status === 'failed' ? tx.log?.[tx.log.length - 1]?.message : undefined,
    transaction: tx,
  });
}
