import { generateTailoredResumeWithAI } from '../../server/gemini.ts';

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
    const { fullName, careerField, experienceLevel, location, email, phone } = body;
    const cvData = await generateTailoredResumeWithAI({
      fullName: fullName || 'Profissional',
      careerField: careerField || 'Geral',
      experienceLevel: experienceLevel || 'Júnior (1-3 anos)',
      location: location || 'Maputo, Moçambique',
      email: email || '',
      phone: phone || '',
    });
    return res.status(200).json({ success: true, cvData });
  } catch (error: any) {
    console.warn('AI fallback in generate-tailored-cv handler:', error?.message);
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const cvData = await generateTailoredResumeWithAI({
      fullName: body?.fullName || 'Profissional',
      careerField: body?.careerField || 'Geral',
      experienceLevel: body?.experienceLevel || 'Júnior',
      location: body?.location || 'Maputo, Moçambique',
      email: body?.email || '',
      phone: body?.phone || '',
    });
    return res.status(200).json({ success: true, cvData });
  }
}
