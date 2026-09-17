import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Sparkles,
  Award
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

const experienceOptions: UserProfile['experienceLevel'][] = [
  'Estudante / Recém-graduado',
  'Júnior (1-3 anos)',
  'Pleno (3-5 anos)',
  'Sénior (+5 anos)',
  'Executivo / Direção',
];

const provincesMozambique = [
  'Maputo Cidade',
  'Maputo Província (Matola)',
  'Gaza (Xai-Xai)',
  'Inhambane',
  'Sofala (Beira)',
  'Manica (Chimoio)',
  'Tete',
  'Zambézia (Quelimane)',
  'Nampula',
  'Cabo Delgado (Pemba)',
  'Niassa (Lichinga)',
  'Diáspora / Outro',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, registerThreeStep, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sync mode whenever modal opens or initialMode prop changes
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep(1);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  // Form State
  // Step 1: Credenciais
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Dados Complementares & Moçambique
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cityProvince, setCityProvince] = useState(provincesMozambique[0]);
  const [careerField, setCareerField] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<UserProfile['experienceLevel']>('Júnior (1-3 anos)');

  // Step 3: Segurança, Termos & Condições
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Reset state on switch
  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    setStep(1);
    setError(null);
    setSuccessMsg(null);
  };

  if (!isOpen) return null;

  const validateStep1 = () => {
    if (!fullName.trim()) return 'Insira o seu nome completo.';
    if (!email.trim() || !email.includes('@')) return 'Insira um endereço de e-mail válido.';
    if (password.length < 6) return 'A senha deve conter no mínimo 6 caracteres.';
    if (password !== confirmPassword) return 'As senhas não coincidem.';
    return null;
  };

  const validateStep2 = () => {
    if (!phoneNumber.trim() || phoneNumber.length < 8) return 'Insira um número de telefone válido (Ex: 84/85/86/87...).';
    if (!careerField.trim()) return 'Indique a sua área de atuação ou formação (Ex: Contabilidade, TI, Gestão).';
    return null;
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
      setStep(3);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted || !privacyAccepted) {
      setError('Deve aceitar os Termos de Uso e a Política de Privacidade para criar a conta.');
      return;
    }

    setLoading(true);
    try {
      await registerThreeStep({
        email,
        pass: password,
        fullName,
        phoneNumber,
        cityProvince,
        careerField,
        experienceLevel,
        termsAccepted,
        privacyAccepted,
        marketingConsent,
      });

      setSuccessMsg('Conta criada com segurança! Redirecionando...');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já se encontra registado. Experimente iniciar sessão.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError(err.message || 'Falha ao criar conta. Verifique os dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Por favor preencha o seu e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setSuccessMsg('Sessão iniciada com sucesso!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 800);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Credenciais incorretas. Verifique o seu e-mail e senha.');
      } else {
        setError(err.message || 'Erro ao iniciar sessão. Verifique os dados inseridos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Insira o seu e-mail para receber a ligação de redefinição.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccessMsg('Enviámos um e-mail com instruções para redefinir a sua senha.');
    } catch (err: any) {
      setError('Não foi possível enviar o e-mail. Verifique o endereço digitado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md animate-fade-in">
      <div 
        id="auth-modal-container"
        className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[28px] border border-blue-100 shadow-[0_25px_60px_rgba(30,58,138,0.18)] overflow-hidden transition-all text-[#0F172A]"
      >
        {/* Top Gradient Banner */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-md shadow-blue-500/20 mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
              {mode === 'register' && 'Criar Conta Segura (3 Etapas)'}
              {mode === 'login' && 'Iniciar Sessão'}
              {mode === 'forgot' && 'Recuperar Senha'}
            </h3>

            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              {mode === 'register' && 'Guarde os seus currículos e garanta acesso vitalício após o pagamento.'}
              {mode === 'login' && 'Aceda aos seus currículos guardados e histórico de pagamento.'}
              {mode === 'forgot' && 'Introduza o seu e-mail para redefinir a palavra-passe.'}
            </p>
          </div>

          {/* Mode Selector Tabs (Iniciar Sessão vs Criar Conta) */}
          {mode !== 'forgot' && (
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200/80">
              <button
                type="button"
                id="auth-tab-login"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Iniciar Sessão</span>
              </button>
              <button
                type="button"
                id="auth-tab-register"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Criar Conta</span>
              </button>
            </div>
          )}

          {/* Stepper for Registration */}
          {mode === 'register' && (
            <div className="mb-6">
              <div className="flex items-center justify-between relative">
                {/* Connecting bar */}
                <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />
                <div 
                  className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-blue-600 transition-all duration-300 -z-0"
                  style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                />

                {/* Step 1 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= 1 ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' : 'bg-slate-100 text-slate-400'
                  }`}>
                    1
                  </div>
                  <span className="text-[10px] font-bold mt-1 text-[#0F172A]">Acesso</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= 2 ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' : 'bg-slate-100 text-slate-400'
                  }`}>
                    2
                  </div>
                  <span className="text-[10px] font-bold mt-1 text-[#0F172A]">Perfil</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === 3 ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30' : 'bg-slate-100 text-slate-400'
                  }`}>
                    3
                  </div>
                  <span className="text-[10px] font-bold mt-1 text-[#0F172A]">Termos</span>
                </div>
              </div>
            </div>
          )}

          {/* Alert messages */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* REGISTER FLOW */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              {/* STEP 1: CREDENCIAIS */}
              {step === 1 && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Nome Completo <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: Arsénio Mabunda"
                        className="apple-input w-full pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Endereço de E-mail <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seuemail@dominio.co.mz"
                        className="apple-input w-full pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Palavra-passe Segura <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="apple-input w-full pl-10 pr-10 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Confirmar Palavra-passe <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a palavra-passe"
                        className="apple-input w-full pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full btn-apple-warm py-3 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      Avançar para Etapa 2 (Perfil)
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: INFORMAÇÕES PESSOAIS & PROFISSIONAIS */}
              {step === 2 && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Contacto Telefónico <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+258 84 123 4567"
                        className="apple-input w-full pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-slate-400"
                      />
                    </div>
                    <p className="text-[10px] text-[#64748B] mt-1">
                      Utilizado para confirmação segura de pagamentos locais.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Cidade / Província em Moçambique <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={cityProvince}
                        onChange={(e) => setCityProvince(e.target.value)}
                        className="apple-input w-full pl-10 pr-3.5 py-2.5 text-xs font-bold text-[#0F172A]"
                      >
                        {provincesMozambique.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Área Profissional Principal <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={careerField}
                        onChange={(e) => setCareerField(e.target.value)}
                        placeholder="Ex: Engenharia de Software, Contabilidade, Saúde"
                        className="apple-input w-full pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Nível de Experiência
                    </label>
                    <div className="relative">
                      <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value as UserProfile['experienceLevel'])}
                        className="apple-input w-full pl-10 pr-3.5 py-2.5 text-xs font-bold text-[#0F172A]"
                      >
                        {experienceOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 btn-apple-warm py-3 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      Avançar para Etapa 3 (Termos)
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: TERMOS, PRIVACIDADE & FINALIZAÇÃO */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-h-40 overflow-y-auto text-[11px] text-slate-600 leading-relaxed space-y-2">
                    <p className="font-bold text-[#0F172A]">Termos de Uso e Proteção de Dados (Moçambique)</p>
                    <p>
                      1. <strong>Acesso & Não-Duplicação de Pagamento:</strong> Ao criar a sua conta, os seus currículos e pagamentos de taxa única ficam permanentemente associados ao seu e-mail, dispensando pagamentos futuros repetidos no mesmo dispositivo ou outros navegadores.
                    </p>
                    <p>
                      2. <strong>Confidencialidade:</strong> Os seus dados curriculares e pessoais não são partilhados com terceiros sem a sua autorização expressa.
                    </p>
                    <p>
                      3. <strong>Segurança:</strong> Todas as credenciais são criptografadas com protocolos de autenticação em nuvem.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <label className="flex items-start gap-2.5 text-xs text-[#0F172A] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>
                        Declaro que li e <strong>concordo com os Termos de Serviço</strong> da plataforma. <span className="text-rose-500">*</span>
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs text-[#0F172A] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>
                        Concordo com a <strong>Política de Privacidade e Proteção de Dados</strong>. <span className="text-rose-500">*</span>
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketingConsent}
                        onChange={(e) => setMarketingConsent(e.target.checked)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>
                        Desejo receber dicas de recrutamento e novos modelos de currículo para o mercado moçambicano. (Opcional)
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={loading}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !termsAccepted || !privacyAccepted}
                      className="flex-1 btn-apple-warm py-3 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                      {loading ? 'A criar conta segura...' : 'Concluir Registo Seguro'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* LOGIN FLOW */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@dominio.co.mz"
                    className="apple-input w-full pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#0F172A]">
                    Palavra-passe
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="apple-input w-full pl-10 pr-10 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-apple-warm py-3 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {loading ? 'A autenticar...' : 'Entrar na Minha Conta'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FLOW */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  O seu e-mail cadastrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@dominio.co.mz"
                    className="apple-input w-full pl-10 pr-3.5 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-apple-warm py-3 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? 'A enviar link...' : 'Enviar Link de Redefinição'}
              </button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 pt-1"
              >
                Voltar para Início de Sessão
              </button>
            </form>
          )}

          {/* Footer toggle */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            {mode === 'register' ? (
              <p className="text-xs text-[#64748B]">
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Entrar aqui
                </button>
              </p>
            ) : mode === 'login' ? (
              <p className="text-xs text-[#64748B]">
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Criar conta em 3 passos
                </button>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
