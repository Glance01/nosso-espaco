import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { netshop, NetshopInitiateRequest } from './netshop.ts';
import { improveSummaryWithAI, suggestSkillsWithAI, generateTailoredResumeWithAI, generateCoverLetterWithAI } from './gemini.ts';

dotenv.config();

export const app = express();

// Enable CORS and JSON parsing
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// In-memory store for transactions & webhook events
export interface StoredTx {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  method: string;
  phone?: string;
  email?: string;
  name?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  netshopId?: string;
  log?: any[];
}

export const transactions = new Map<string, StoredTx>();
export const webhookLogs: any[] = [];
export const subscribers = new Map<string, { phone?: string; expiresAt: string; reference: string }>();

// Router to handle routes both with /api and without /api prefix
const apiRouter = express.Router();

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Candidate-se',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    netshopConfigured: Boolean(process.env.NETSHOP_API_KEY),
  });
});

// 1. App / Payment Configuration
apiRouter.get('/config', (req, res) => {
  const netshopStatus = netshop.getStatus();
  const monthlyPrice = parseInt(process.env.PREMIUM_MONTHLY_PRICE_MZN || '299', 10);
  
  res.json({
    appName: 'Candidate-se',
    currency: 'MZN',
    monthlyPriceMzn: monthlyPrice,
    netshop: {
      ...netshopStatus,
      webhookUrl: `${process.env.APP_URL || req.protocol + '://' + req.get('host')}/api/webhooks/netshop`,
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
});

// 2. Iniciar Pagamento via Netshop API
apiRouter.post('/payments/initiate', async (req, res) => {
  try {
    const { paymentMethod = 'card', customerPhone, customerEmail, customerName, amount, cardDetails } = req.body;
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
      callbackUrl: `${process.env.APP_URL || req.protocol + '://' + req.get('host')}/api/webhooks/netshop`,
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

    const tx: StoredTx = {
      id: netshopRes.transactionId || `tx_${Date.now()}`,
      reference,
      amount: finalAmount,
      currency: 'MZN',
      method: finalMethod,
      phone: customerPhone,
      email: customerEmail,
      name: customerName,
      status: netshopRes.status,
      createdAt: new Date().toISOString(),
      netshopId: netshopRes.transactionId,
      log: [{ timestamp: new Date().toISOString(), message: netshopRes.message }],
    };

    transactions.set(reference, tx);

    res.json({
      success: true,
      reference,
      transactionId: netshopRes.transactionId,
      status: netshopRes.status,
      message: netshopRes.message,
      checkoutUrl: netshopRes.checkoutUrl,
    });
  } catch (error: any) {
    console.error('Erro ao iniciar pagamento Netshop:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Erro ao comunicar com o gateway de pagamentos',
    });
  }
});

// 3. Consultar Estado do Pagamento
apiRouter.get('/payments/status/:reference', async (req, res) => {
  const { reference } = req.params;
  const tx = transactions.get(reference);

  if (!tx) {
    return res.status(404).json({ success: false, message: 'Transação não encontrada' });
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

  res.json({
    success: true,
    status: tx.status,
    message: tx.status === 'failed' ? tx.log?.[tx.log.length - 1]?.message : undefined,
    transaction: tx,
  });
});

// 4. Ping de Teste da API Netshop
apiRouter.get('/admin/netshop-ping', async (req, res) => {
  try {
    const pingResult = await netshop.ping();
    res.json(pingResult);
  } catch (e: any) {
    res.status(500).json({ ok: false, message: e?.message });
  }
});

// 5. Confirmar Pagamento Manualmente / Teste
apiRouter.post('/payments/confirm', (req, res) => {
  const { reference } = req.body;
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

  res.json({
    success: true,
    status: 'completed',
    transaction: tx,
    expiresAt: expires.toISOString(),
  });
});

// 6. Netshop Webhook Receiver
const handleWebhook = (req: express.Request, res: express.Response) => {
  const payload = req.body || {};
  const signature = req.headers['x-netshop-signature'] || req.headers['authorization'];
  
  console.log('[Netshop Webhook Received]:', JSON.stringify(payload, null, 2));

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

  res.status(200).json({ received: true, timestamp: new Date().toISOString() });
};

apiRouter.post('/webhooks/netshop', handleWebhook);
apiRouter.post('/payments/webhook', handleWebhook);

apiRouter.get('/admin/webhooks', (req, res) => {
  res.json({
    total: webhookLogs.length,
    logs: webhookLogs,
  });
});

// 7. IA Gemini: Melhorar Resumo Profissional
apiRouter.post('/ai/enhance-summary', async (req, res) => {
  try {
    const { currentSummary, jobTitle, skills, tone } = req.body;
    const improved = await improveSummaryWithAI({
      currentSummary: currentSummary || '',
      jobTitle: jobTitle || '',
      skills: skills || [],
      tone,
    });
    res.json({ success: true, summary: improved });
  } catch (error: any) {
    console.warn('AI fallback:', error?.message);
    res.json({ success: true, summary: req.body?.currentSummary || 'Profissional dedicado com sólida trajetória na execução de projetos e foco em inovação e resultados.' });
  }
});

// 8. IA Gemini: Sugerir Competências
apiRouter.post('/ai/suggest-skills', async (req, res) => {
  try {
    const { jobTitle } = req.body;
    const skills = await suggestSkillsWithAI(jobTitle || 'Profissional');
    res.json({ success: true, skills });
  } catch (error: any) {
    console.warn('AI fallback skills:', error?.message);
    res.json({ success: true, skills: ['Gestão de Projetos', 'Comunicação Estratégica', 'Resolução de Problemas', 'Trabalho em Equipa', 'Orientação para Resultados'] });
  }
});

// 9. IA Gemini: Gerar Currículo Personalizado
apiRouter.post('/ai/generate-tailored-cv', async (req, res) => {
  try {
    const { fullName, careerField, experienceLevel, location, email, phone } = req.body;
    const cvData = await generateTailoredResumeWithAI({
      fullName: fullName || 'Profissional',
      careerField: careerField || 'Geral',
      experienceLevel: experienceLevel || 'Júnior (1-3 anos)',
      location: location || 'Maputo, Moçambique',
      email: email || '',
      phone: phone || '',
    });
    res.json({ success: true, cvData });
  } catch (error: any) {
    console.warn('AI fallback CV:', error?.message);
    const cvData = await generateTailoredResumeWithAI({
      fullName: req.body?.fullName || 'Profissional',
      careerField: req.body?.careerField || 'Geral',
      experienceLevel: req.body?.experienceLevel || 'Júnior',
      location: req.body?.location || 'Maputo',
      email: req.body?.email || '',
      phone: req.body?.phone || '',
    });
    res.json({ success: true, cvData });
  }
});

// 10. IA Gemini: Gerar Carta de Apresentação
apiRouter.post('/ai/generate-cover-letter', async (req, res) => {
  try {
    const { fullName, careerField, jobTitle, companyName, recipientName, experienceSummary } = req.body;
    const letterData = await generateCoverLetterWithAI({
      fullName: fullName || 'Profissional',
      careerField: careerField || 'Profissional',
      jobTitle: jobTitle || careerField || 'Especialista',
      companyName: companyName || 'Empresa em Moçambique',
      recipientName: recipientName || 'Diretor de Recursos Humanos',
      experienceSummary: experienceSummary || '',
    });
    res.json({ success: true, letterData });
  } catch (error: any) {
    console.warn('AI fallback letter:', error?.message);
    const letterData = await generateCoverLetterWithAI({
      fullName: req.body?.fullName || 'Profissional',
      careerField: req.body?.careerField || 'Profissional',
      jobTitle: req.body?.jobTitle || 'Especialista',
      companyName: req.body?.companyName || 'Empresa',
      recipientName: req.body?.recipientName || 'Diretor',
      experienceSummary: '',
    });
    res.json({ success: true, letterData });
  }
});

// 11. Status de Subscrição por Telefone
apiRouter.get('/subscriptions/check', (req, res) => {
  const phone = req.query.phone as string;
  if (!phone) {
    return res.json({ isActive: false });
  }

  const normalized = netshop.normalizePhone(phone);
  const sub = subscribers.get(normalized) || subscribers.get(phone);

  if (sub && new Date(sub.expiresAt) > new Date()) {
    return res.json({
      isActive: true,
      expiresAt: sub.expiresAt,
      reference: sub.reference,
      phone: sub.phone,
    });
  }

  res.json({ isActive: false });
});

// Mount router on BOTH '/api' and '/' so it always works regardless of serverless path rewriting
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
