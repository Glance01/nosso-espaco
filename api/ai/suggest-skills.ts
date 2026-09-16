import { suggestSkillsWithAI } from '../../server/gemini.ts';

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
    const { jobTitle } = body;
    const skills = await suggestSkillsWithAI(jobTitle || 'Profissional');
    return res.status(200).json({ success: true, skills });
  } catch (error: any) {
    console.warn('AI fallback in suggest-skills handler:', error?.message);
    return res.status(200).json({
      success: true,
      skills: [
        'Gestão de Projetos e Prazos',
        'Comunicação Estratégica',
        'Resolução de Problemas Complexos',
        'Trabalho em Equipa Multidisciplinar',
        'Orientação para Resultados e Eficiência',
      ],
    });
  }
}
