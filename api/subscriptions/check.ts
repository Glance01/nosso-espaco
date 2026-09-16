import { netshop } from '../../server/netshop.ts';
import { subscribers } from '../../server/app.ts';

export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const phone = req.query?.phone as string;
  if (!phone) {
    return res.status(200).json({ isActive: false });
  }

  const normalized = netshop.normalizePhone(phone);
  const sub = subscribers.get(normalized) || subscribers.get(phone);

  if (sub && new Date(sub.expiresAt) > new Date()) {
    return res.status(200).json({
      isActive: true,
      expiresAt: sub.expiresAt,
      reference: sub.reference,
      phone: sub.phone,
    });
  }

  return res.status(200).json({ isActive: false });
}
