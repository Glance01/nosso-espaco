import { generateCoverLetterWithAI } from '../../server/gemini.ts';

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
    const { fullName, careerField, jobTitle, companyName, recipientName, experienceSummary } = body;
    const letterData = await generateCoverLetterWithAI({
      fullName: fullName || 'Profissional',
      careerField: careerField || 'Profissional',
      jobTitle: jobTitle || careerField || 'Especialista',
      companyName: companyName || 'Empresa em Moçambique',
      recipientName: recipientName || 'Diretor de Recursos Humanos',
      experienceSummary: experienceSummary || '',
    });
    return res.status(200).json({ success: true, letterData });
  } catch (error: any) {
    console.warn('AI fallback in generate-cover-letter handler:', error?.message);
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const letterData = await generateCoverLetterWithAI({
      fullName: body?.fullName || 'Profissional',
      careerField: body?.careerField || 'Profissional',
      jobTitle: body?.jobTitle || 'Especialista',
      companyName: body?.companyName || 'Empresa em Moçambique',
      recipientName: body?.recipientName || 'Diretor',
      experienceSummary: '',
    });
    return res.status(200).json({ success: true, letterData });
  }
}
