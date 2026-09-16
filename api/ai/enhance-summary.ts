import { improveSummaryWithAI } from '../../server/gemini.ts';

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
    const { currentSummary, jobTitle, skills, tone } = body;
    const improved = await improveSummaryWithAI({
      currentSummary: currentSummary || '',
      jobTitle: jobTitle || '',
      skills: skills || [],
      tone,
    });
    return res.status(200).json({ success: true, summary: improved });
  } catch (error: any) {
    console.warn('AI fallback in enhance-summary handler:', error?.message);
    const fallback = 'Profissional dedicado e proativo com sólida trajetória na execução de projetos de alto impacto, liderança colaborativa e foco contínuo em inovação e resultados estratégicos.';
    return res.status(200).json({ success: true, summary: fallback });
  }
}
