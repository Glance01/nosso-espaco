import { GoogleGenAI } from '@google/genai';
import { CVData } from '../src/types';
import { initialCVData } from '../src/data/initialData';

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI:', e);
    }
  }
  return aiClient;
}

async function generateWithFallback(ai: GoogleGenAI, prompt: string): Promise<string> {
  const models = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      if (response.text?.trim()) {
        return response.text.trim();
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Fallback] Model ${model} failed, trying next:`, err?.message || err);
    }
  }
  throw lastError;
}

export async function improveSummaryWithAI(params: {
  currentSummary: string;
  jobTitle: string;
  skills: string[];
  tone?: string;
}): Promise<string> {
  const ai = getAI();
  if (!ai) {
    return 'Profissional dedicado e proativo, com sólida trajetória na execução de projetos de alto impacto, liderança colaborativa e foco contínuo em inovação, eficiência e resultados estratégicos.';
  }

  try {
    const prompt = `Você é um especialista sénior em recrutamento e elaboração de currículos para o mercado lusófono e moçambicano.
Melhore ou reescreva o seguinte Resumo Profissional / Perfil para torná-lo altamente persuasivo, elegante, focado em realizações e impacto.

Cargo/Título: ${params.jobTitle || 'Profissional'}
Competências-chave: ${params.skills.join(', ') || 'Gestão, Liderança, Comunicação'}
Resumo Atual: ${params.currentSummary || 'Sem resumo'}

Diretrizes:
- Responda apenas com o texto melhorado em Português (sem introduções, sem aspas e sem explicações).
- Escreva entre 3 a 5 frases fluidas, impactantes e profissionais.
- Adapte para o mercado de trabalho moderno.`;

    const text = await generateWithFallback(ai, prompt);
    return text || params.currentSummary;
  } catch (error: any) {
    console.error('Error calling Gemini for summary:', error?.message);
    return params.currentSummary || 'Profissional experiente e orientado a resultados, com comprovada capacidade de entrega em ambientes dinâmicos.';
  }
}

export async function suggestSkillsWithAI(jobTitle: string): Promise<string[]> {
  const ai = getAI();
  if (!ai) {
    return ['Comunicação Interpessoal', 'Liderança de Equipas', 'Resolução de Problemas', 'Gestão de Tempo', 'Metodologias Ágeis'];
  }

  try {
    const prompt = `Gere uma lista JSON contendo as 6 principais competências técnicas e comportamentais mais valorizadas para a profissão: "${jobTitle}".
Retorne APENAS um array JSON de strings no formato: ["Competência 1", "Competência 2", ...]. Sem blocos de código adicionais.`;

    const text = await generateWithFallback(ai, prompt);
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return ['Gestão de Projetos', 'Comunicação Estratégica', 'Resolução de Problemas Complexos', 'Inovação e Processos', 'Trabalho em Equipa'];
  }
}

export async function generateCoverLetterWithAI(params: {
  fullName: string;
  careerField: string;
  jobTitle: string;
  companyName: string;
  recipientName: string;
  experienceSummary: string;
}): Promise<{
  recipientName: string;
  companyName: string;
  companyAddress: string;
  positionApplied: string;
  salutation: string;
  openingParagraph: string;
  bodyParagraph1: string;
  bodyParagraph2: string;
  closingParagraph: string;
  signOff: string;
}> {
  const ai = getAI();
  const defaultLetter = {
    recipientName: params.recipientName || 'Diretor de Recursos Humanos',
    companyName: params.companyName || 'Empresa em Moçambique',
    companyAddress: 'Maputo, Moçambique',
    positionApplied: params.jobTitle || params.careerField,
    salutation: `Exmo(a). Sr(a). ${params.recipientName || 'Diretor de Recursos Humanos'},`,
    openingParagraph: `Venho por meio desta demonstrar o meu vivo interesse na vaga de ${params.jobTitle || params.careerField} na ${params.companyName || 'vosso prestigiado quadro'}, motivado(a) pela reputação de excelência e inovação da instituição no mercado moçambicano.`,
    bodyParagraph1: `Com sólido percurso profissional na área de ${params.careerField}, desenvolvi competências avançadas em gestão de projetos, resolução de problemas complexos e entrega de resultados de alto impacto alinhados aos padrões exigidos pelo mercado corporativo nacional.`,
    bodyParagraph2: `A minha experiência anterior permitiu-me liderar equipas multidisciplinares, otimizar processos operacionais e garantir rigor e conformidade regulatória. Acredito que o meu perfil técnico e proativo agregará valor imediato aos vossos objetivos estratégicos.`,
    closingParagraph: `Agradeço desde já a atenção dispensada à minha candidatura e manifesto total disponibilidade para uma entrevista, onde terei todo o gosto em detalhar as minhas qualificações e contributos potenciais.`,
    signOff: `Com os melhores cumprimentos,\n${params.fullName || 'Profissional'}`
  };

  if (!ai) {
    return defaultLetter;
  }

  try {
    const prompt = `Você é um consultor sénior de carreira em Moçambique. Escreva uma Carta de Apresentação e Motivação altamente profissional, formal e persuasiva em Português de Moçambique para um candidato candidatar-se a um emprego.
Dados do Candidato:
- Nome: ${params.fullName}
- Área/Profissão: ${params.careerField}
- Cargo Pretendido: ${params.jobTitle}
- Empresa Destino: ${params.companyName}
- Destinatário: ${params.recipientName}
- Resumo da Experiência: ${params.experienceSummary}

Retorne APENAS um objeto JSON válido (sem markdown, sem texto adicional) com esta estrutura exata:
{
  "recipientName": "${params.recipientName}",
  "companyName": "${params.companyName}",
  "companyAddress": "Maputo, Moçambique",
  "positionApplied": "${params.jobTitle}",
  "salutation": "Exmo(a). Sr(a)...",
  "openingParagraph": "Parágrafo de introdução...",
  "bodyParagraph1": "Primeiro parágrafo de desenvolvimento destacando competências e valor...",
  "bodyParagraph2": "Segundo parágrafo de desenvolvimento destacando resultados e alinhamento com a empresa...",
  "closingParagraph": "Parágrafo de fecho demonstrando entusiasmo pela entrevista...",
  "signOff": "Com os melhores cumprimentos,\n[Nome]"
}`;

    const text = await generateWithFallback(ai, prompt);
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return { ...defaultLetter, ...parsed };
  } catch (e) {
    console.error('Error generating cover letter with AI:', e);
    return defaultLetter;
  }
}

export async function generateTailoredResumeWithAI(params: {
  fullName: string;
  careerField: string;
  experienceLevel: string;
  location: string;
  email: string;
  phone: string;
}): Promise<CVData> {
  const ai = getAI();
  if (!ai) {
    return {
      ...initialCVData,
      personal: {
        ...initialCVData.personal,
        fullName: params.fullName || 'Profissional Exemplar',
        jobTitle: `${params.careerField} Especialista`,
        email: params.email,
        phone: params.phone,
        location: params.location || 'Maputo, Moçambique',
      }
    };
  }

  try {
    const prompt = `Você é um especialista sénior em recrutamento e RH em Moçambique.
Gere um modelo de currículo profissional completo e adaptado para a profissão/área: "${params.careerField}" (Nível: "${params.experienceLevel}", Localização: "${params.location || 'Maputo, Moçambique'}", Nome: "${params.fullName}", E-mail: "${params.email}", Telefone: "${params.phone}").

Retorne APENAS um objeto JSON válido (sem texto antes ou depois, sem crases de markdown) com exatamente esta estrutura de dados:
{
  "personal": {
    "fullName": "${params.fullName}",
    "jobTitle": "Cargo profissional ideal para ${params.careerField}",
    "email": "${params.email}",
    "phone": "${params.phone}",
    "location": "${params.location || 'Maputo, Moçambique'}",
    "website": "",
    "linkedin": "",
    "github": "",
    "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    "summary": "Resumo profissional de 3 a 4 frases destacando competências e impacto em ${params.careerField} no mercado de Moçambique."
  },
  "experiences": [
    {
      "id": "exp-1",
      "role": "Cargo Sénior / Coordenador",
      "company": "Empresa de Referência em Moçambique",
      "location": "${params.location || 'Maputo'}",
      "startDate": "2021-01",
      "endDate": "",
      "current": true,
      "description": "Responsabilidades e realizações de destaque na área de ${params.careerField}."
    },
    {
      "id": "exp-2",
      "role": "Profissional de ${params.careerField}",
      "company": "Organização Nacional",
      "location": "${params.location || 'Maputo'}",
      "startDate": "2018-03",
      "endDate": "2020-12",
      "current": false,
      "description": "Atividades desenvolvidas e projetos de sucesso."
    }
  ],
  "educations": [
    {
      "id": "edu-1",
      "degree": "Licenciatura em ${params.careerField}",
      "institution": "Universidade em Moçambique",
      "location": "${params.location || 'Maputo'}",
      "startDate": "2014-02",
      "endDate": "2017-11",
      "current": false,
      "description": "Formação académica superior na área."
    }
  ],
  "skills": [
    { "id": "sk-1", "name": "Competência 1 relevante para ${params.careerField}", "level": 5 },
    { "id": "sk-2", "name": "Competência 2 relevante", "level": 5 },
    { "id": "sk-3", "name": "Competência 3 relevante", "level": 4 },
    { "id": "sk-4", "name": "Competência 4 relevante", "level": 4 },
    { "id": "sk-5", "name": "Competência 5 relevante", "level": 4 }
  ],
  "languages": [
    { "id": "lang-1", "name": "Português", "proficiency": "Nativo" },
    { "id": "lang-2", "name": "Inglês", "proficiency": "Fluente" }
  ],
  "certifications": [
    { "id": "cert-1", "name": "Certificação Profissional em ${params.careerField}", "issuer": "Instituição Reconhecida", "date": "2022-06" }
  ]
}`;

    const text = await generateWithFallback(ai, prompt);
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (e) {
    console.error('Error generating tailored CV with AI:', e);
    return {
      ...initialCVData,
      personal: {
        ...initialCVData.personal,
        fullName: params.fullName || 'Profissional',
        jobTitle: `${params.careerField} Especialista`,
        email: params.email,
        phone: params.phone,
        location: params.location || 'Maputo, Moçambique',
      }
    };
  }
}

