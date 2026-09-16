import { netshop, NetshopInitiateRequest } from '../../server/netshop.ts';
import { transactions, StoredTx } from '../../server/app.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { paymentMethod = 'card', customerPhone, customerEmail, customerName, amount, cardDetails } = body;
    const finalMethod = 'card';
    const finalAmount = Number(amount) || parseInt(process.env.PREMIUM_MONTHLY_PRICE_MZN || '299', 10);
    const reference = `CV-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    const initiateReq: NetshopInitiateRequest = {
      reference,
      amount: finalAmount,
      currency: 'MZN',
      paymentMethod: finalMethod,
      customerPhone,
      customerEmail: customerEmail || 'cliente@cv.co.mz',
      customerName: customerName || 'Cliente CV Pro',
      cardDetails,
      callbackUrl: `${process.env.APP_URL || 'https://candidata-te.vercel.app'}/api/webhooks/netshop`,
    };

    const netshopRes = await netshop.initiatePayment(initiateReq);

    if (!netshopRes.success) {
      const failedTx: StoredTx = {
        id: netshopRes.transactionId || `tx_${Date.now()}`,
        reference,
        amount: finalAmount,
        currency: 'MZN',
        method: finalMethod,
        phone: customerPhone,
        email: customerEmail,
        name: customerName,
        status: 'failed',
        createdAt: new Date().toISOString(),
        log: [{ timestamp: new Date().toISOString(), message: netshopRes.message }],
      };
      transactions.set(reference, failedTx);

      return res.status(400).json({
        success: false,
        reference,
        message: netshopRes.message || 'Falha ao iniciar pagamento',
      });
    }

    const newTx: StoredTx = {
      id: netshopRes.transactionId || `tx_${Date.now()}`,
      reference,
      amount: finalAmount,
      currency: 'MZN',
      method: finalMethod,
      phone: customerPhone,
      email: customerEmail,
      name: customerName,
      status: netshopRes.status || 'pending',
      createdAt: new Date().toISOString(),
      netshopId: netshopRes.transactionId,
      log: [{ timestamp: new Date().toISOString(), message: 'Transação iniciada via Netshop' }],
    };
    transactions.set(reference, newTx);

    return res.status(200).json({
      success: true,
      reference,
      transactionId: netshopRes.transactionId,
      status: netshopRes.status,
      message: netshopRes.message,
      checkoutUrl: netshopRes.checkoutUrl,
    });
  } catch (error: any) {
    console.error('Erro ao iniciar pagamento Netshop:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Erro ao comunicar com o gateway de pagamentos',
    });
  }
}
