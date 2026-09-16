export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
  const netshopConfigured = Boolean(process.env.NETSHOP_API_KEY && process.env.NETSHOP_API_KEY.trim().length > 5);

  return res.status(200).json({
    status: 'ok',
    app: 'Candidate-se',
    timestamp: new Date().toISOString(),
    geminiConfigured,
    netshopConfigured,
    env: {
      nodeEnv: process.env.NODE_ENV || 'production',
      hasGeminiKey: geminiConfigured,
      hasNetshopKey: netshopConfigured,
      hasWalletId: Boolean(process.env.NETSHOP_WALLET_ID),
    },
  });
}
