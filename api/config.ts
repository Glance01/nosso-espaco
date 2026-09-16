import { netshop } from '../server/netshop.ts';

export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const netshopStatus = netshop.getStatus();
  const monthlyPrice = parseInt(process.env.PREMIUM_MONTHLY_PRICE_MZN || '299', 10);

  return res.status(200).json({
    appName: 'Candidate-se',
    currency: 'MZN',
    monthlyPriceMzn: monthlyPrice,
    netshop: {
      ...netshopStatus,
      webhookUrl: `${process.env.APP_URL || 'https://candidata-te.vercel.app'}/api/webhooks/netshop`,
    },
    paymentMethods: [
      {
        id: 'card',
        name: 'Cartão Bancário',
        operator: 'Millennium BIM / BCI / Standard Bank / Visa / Mastercard',
        color: '#0284c7',
        phonePrefixes: [],
        description: 'Cartão de Débito ou Crédito internacional e nacional com aprovação instantânea 3D-Secure',
        badge: '100% Funcional',
      },
    ],
  });
}
