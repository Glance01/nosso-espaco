import { CVData, StyleConfig } from '../types';

export const initialCVData: CVData = {
  personal: {
    fullName: 'Arsénio Mabunda',
    jobTitle: 'Engenheiro de Software Sénior & Líder Técnico',
    email: 'arsenio.mabunda@exemplo.co.mz',
    phone: '+258 84 123 4567',
    location: 'Maputo, Moçambique',
    website: 'https://arsenio.dev',
    linkedin: 'linkedin.com/in/arsenio-mabunda',
    github: 'github.com/arsenio-mz',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    summary: 'Engenheiro de Software Sénior com mais de 7 anos de experiência na arquitetura e desenvolvimento de aplicações web escaláveis e integração de sistemas financeiros em Moçambique. Comprovada capacidade em liderança técnica de equipas multidisciplinares, otimização de performance em 40% e implementação rigorosa de padrões de segurança e conformidade para o setor bancário e corporativo.',
  },
  experiences: [
    {
      id: 'exp-1',
      role: 'Lead Full-Stack Engineer & Arquiteto de Software',
      company: 'Tech Solutions Moçambique',
      location: 'Maputo, Moçambique',
      startDate: '2022-03',
      endDate: '',
      current: true,
      description: '• Liderou equipa de 8 engenheiros no redesenho da plataforma core de pagamentos, reduzindo o tempo de transação em 35%.\n• Implementou integrações seguras com gateways de pagamento móvel (M-Pesa, e-Mola) e sistemas bancários.\n• Coordenou sprints em metodologia Scrum, garantindo entrega contínua e alinhamento estratégico com stakeholders.',
    },
    {
      id: 'exp-2',
      role: 'Desenvolvedor Web Sénior',
      company: 'Inovações Digitais Lda',
      location: 'Matola, Moçambique',
      startDate: '2019-01',
      endDate: '2022-02',
      current: false,
      description: '• Desenvolveu portais corporativos de alta disponibilidade utilizando React, TypeScript e microsserviços Node.js.\n• Otimizou consultas em bases de dados relacionais (PostgreSQL), elevando a velocidade de resposta das plataformas em 45%.\n• Ministrou formação técnica interna sobre boas práticas de código limpo e testes automatizados.',
    },
    {
      id: 'exp-3',
      role: 'Programador Júnior & Suporte de Sistemas',
      company: 'Byte MZ Informática',
      location: 'Maputo',
      startDate: '2017-08',
      endDate: '2018-12',
      current: false,
      description: '• Projetou interfaces de utilizador responsivas e eficientes para clientes dos setores de retalho e educação.\n• Prestou suporte técnico especializado a infraestruturas de rede e resolução de incidentes críticos.',
    }
  ],
  educations: [
    {
      id: 'edu-1',
      degree: 'Licenciatura em Engenharia Informática',
      institution: 'Universidade Eduardo Mondlane (UEM)',
      location: 'Maputo',
      startDate: '2014-02',
      endDate: '2018-11',
      current: false,
      description: 'Especialização em Sistemas Distribuídos e Engenharia de Software. Conclusão com distinção académica (Média: 16/20).',
    },
    {
      id: 'edu-2',
      degree: 'Pós-Graduação em Gestão de Projetos Tecnológicos',
      institution: 'Instituto Superior de Transportes e Comunicações (ISUTC)',
      location: 'Maputo',
      startDate: '2020-03',
      endDate: '2021-06',
      current: false,
      description: 'Foco em governação de TI, metodologias ágeis (Scrum Master) e gestão orçamental de projetos.',
    }
  ],
  skills: [
    { id: 'sk-1', name: 'Arquitetura de Software & Microsserviços', level: 5 },
    { id: 'sk-2', name: 'TypeScript / React / Next.js', level: 5 },
    { id: 'sk-3', name: 'Node.js & Express / NestJS', level: 5 },
    { id: 'sk-4', name: 'Integração de Pagamentos (M-Pesa / Cartões)', level: 5 },
    { id: 'sk-5', name: 'PostgreSQL & Base de Dados', level: 4 },
    { id: 'sk-6', name: 'Docker, CI/CD & DevOps', level: 4 },
    { id: 'sk-7', name: 'Gestão de Equipas Ágeis (Scrum)', level: 5 },
  ],
  languages: [
    { id: 'lang-1', name: 'Português', proficiency: 'Nativo' },
    { id: 'lang-2', name: 'Inglês', proficiency: 'Fluente' },
    { id: 'lang-3', name: 'Changana', proficiency: 'Nativo' },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      date: '2023-05',
    },
    {
      id: 'cert-2',
      name: 'Professional Scrum Master (PSM I)',
      issuer: 'Scrum.org',
      date: '2022-09',
    },
  ],
};

export const defaultStyleConfig: StyleConfig = {
  template: 'modern',
  colorScheme: 'emerald',
  fontFamily: 'sans',
  spacing: 'normal',
  showPhoto: true,
  showSkillBars: true,
};

export const emptyCVData: CVData = {
  personal: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  },
  experiences: [],
  educations: [],
  skills: [],
  languages: [],
  certifications: [],
};
