export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  photoUrl?: string;
  summary: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1 to 5
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'Básico' | 'Intermédio' | 'Avançado' | 'Fluente' | 'Nativo';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface CVData {
  personal: PersonalInfo;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
}

export type TemplateId = 'modern' | 'executive' | 'minimalist' | 'creative' | 'compact' | 'elegant';

export type PrimaryColor = 
  | 'emerald' 
  | 'blue' 
  | 'indigo' 
  | 'rose' 
  | 'slate' 
  | 'amber' 
  | 'teal' 
  | 'violet';

export interface StyleConfig {
  template: TemplateId;
  colorScheme: PrimaryColor;
  fontFamily: 'sans' | 'serif' | 'display';
  spacing: 'compact' | 'normal' | 'spacious';
  showPhoto: boolean;
  showSkillBars: boolean;
}

export type PaymentMethod = 'emola' | 'mpesa' | 'mkesh' | 'card';

export interface PaymentTransaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  externalTransactionId?: string;
  message?: string;
}

export interface SubscriptionInfo {
  isActive: boolean;
  planName: string;
  expiresAt: string | null;
  paymentMethod?: PaymentMethod;
  transactionRef?: string;
  customerPhone?: string;
  priceMzn: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  cityProvince: string;
  careerField: string;
  experienceLevel: 'Estudante / Recém-graduado' | 'Júnior (1-3 anos)' | 'Pleno (3-5 anos)' | 'Sénior (+5 anos)' | 'Executivo / Direção';
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingConsent?: boolean;
  registeredAt: string;
  isPremium?: boolean;
  premiumExpiresAt?: string | null;
  lastActiveAt?: string;
}

export interface SavedResume {
  id: string;
  userId: string;
  title: string;
  cvData: CVData;
  styleConfig: StyleConfig;
  updatedAt: string;
  createdAt: string;
}

export type NotificationType = 'tip' | 'career' | 'system' | 'update' | 'job';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  actionText?: string;
  actionType?: 'sample' | 'coverLetter' | 'template' | 'payment' | 'aiSummary';
}


