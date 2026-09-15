import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Download,
  Lock,
  Sparkles,
  X,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { PaymentMethod, SubscriptionInfo } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyPriceMzn: number;
  onPaymentSuccess: (subscription: SubscriptionInfo) => void;
  onDownloadPdfNow: () => void;
  onRequireAuth?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  monthlyPriceMzn,
  onPaymentSuccess,
  onDownloadPdfNow,
  onRequireAuth,
}) => {
  const { currentUser, userProfile, updateUserPremiumStatus } = useAuth();
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerName, setCustomerName] = useState(userProfile?.displayName || '');

  // Flow states
  const [stage, setStage] = useState<'select' | 'processing' | 'waiting_card' | 'success' | 'error'>('select');
  const [currentReference, setCurrentReference] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<any>(null);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName) setCustomerName(userProfile.displayName);
      if (userProfile.email) setCustomerEmail(userProfile.email);
    } else if (currentUser?.email) {
      setCustomerEmail(currentUser.email);
    }
  }, [userProfile, currentUser]);

  useEffect(() => {
    if (!isOpen) {
      if (pollInterval) clearInterval(pollInterval);
      setStage('select');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInitiatePayment = async () => {
    // Check if logged in for safe lifetime persistence
    if (!currentUser && onRequireAuth) {
      onRequireAuth();
      return;
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      alert('Por favor insira um e-mail válido para receber a confirmação e o recibo do pagamento.');
      return;
    }

    setStage('processing');
    setStatusMessage('A criar sessão segura no Gateway de Pagamento...');

    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'card',
          customerEmail: customerEmail.trim(),
          customerName: customerName.trim() || 'Cliente CV Pro',
          amount: monthlyPriceMzn,
          userId: currentUser?.uid,
        }),
      });

      const data = await res.json().catch(() => ({ success: false, message: 'Falha de comunicação com o servidor.' }));

      if (res.ok && data.success) {
        setCurrentReference(data.reference);
        if (data.checkoutUrl) {
          setCheckoutUrl(data.checkoutUrl);
        }
        setStatusMessage(data.message || 'Sessão 3D-Secure criada com sucesso.');
        setStage('waiting_card');
        startStatusPolling(data.reference);
      } else {
        setStage('error');
        setStatusMessage(data.message || 'Erro ao iniciar transação.');
      }
    } catch (err: any) {
      setStage('error');
      setStatusMessage(err?.message || 'Falha de conexão com o servidor de pagamentos.');
    }
  };

  const startStatusPolling = (ref: string) => {
    if (pollInterval) clearInterval(pollInterval);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${ref}`);
        const data = await res.json();

        if (data.success && data.status === 'completed') {
          clearInterval(interval);
          handleSuccessCompletion(ref);
        } else if (data.success && data.status === 'failed') {
          clearInterval(interval);
          setStage('error');
          setStatusMessage(data.message || 'Transação de cartão não autorizada ou expirada.');
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 2500);

    setPollInterval(interval);
  };

  const handleSuccessCompletion = async (ref: string) => {
    setStage('success');
    
    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    const expiresIso = expires.toISOString();

    // Persist to user's Firebase account
    if (currentUser) {
      await updateUserPremiumStatus(true, expiresIso);
    }

    const newSub: SubscriptionInfo = {
      isActive: true,
      planName: 'Plano Mensal Pro',
      expiresAt: expiresIso,
      paymentMethod: 'card',
      transactionRef: ref,
      priceMzn: monthlyPriceMzn,
    };

    onPaymentSuccess(newSub);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="netshop-payment-modal"
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E2E8F0] flex flex-col max-h-[90vh]"
      >
        {/* Modal Header (Apple Blue) */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#1E40AF] to-[#1D4ED8] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/15 text-white flex items-center justify-center font-bold ring-1 ring-white/25">
              <Sparkles className="w-5 h-5 text-[#EFF6FF]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Assinatura Mensal CV Pro
                <span className="text-[10px] bg-white/20 text-[#EFF6FF] font-semibold px-2.5 py-0.5 rounded-full border border-white/25">
                  Pagamento Seguro
                </span>
              </h3>
              <p className="text-[11px] text-[#BFDBFE]">
                Download PDF Ilimitado • Sem Marcas de Água • Todos os Modelos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#F8FAFC]">
          {stage === 'select' && (
            <>
              {/* Account Link Card */}
              {currentUser ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800">
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Conectado como <strong>{currentUser.email}</strong>. O seu pagamento ficará associado a esta conta.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-2 text-xs text-amber-900">
                  <span>Recomendamos criar uma conta antes para manter o seu acesso guardado.</span>
                  {onRequireAuth && (
                    <button
                      type="button"
                      onClick={onRequireAuth}
                      className="px-3 py-1 bg-amber-600 text-white rounded-xl font-bold shrink-0 hover:bg-amber-700"
                    >
                      Criar Conta
                    </button>
                  )}
                </div>
              )}

              {/* Value Box */}
              <div className="p-5 bg-gradient-to-br from-white to-[#EFF6FF] border border-[#BFDBFE] rounded-3xl flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs font-semibold text-[#2563EB]">Acesso Ilimitado por 30 dias</span>
                  <div className="text-3xl font-extrabold text-[#0F172A] flex items-baseline gap-1 mt-0.5">
                    {monthlyPriceMzn} <span className="text-sm font-semibold text-[#2563EB]">MT / mês</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-[#64748B] space-y-1">
                  <div className="flex items-center justify-end gap-1 font-bold text-[#1D4ED8]">
                    <ShieldCheck className="w-4 h-4 text-[#059669]" /> Pagamento Seguro
                  </div>
                  <span>Aprovação Imediata</span>
                </div>
              </div>

              {/* Exclusive Card Payment Banner */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl space-y-4 shadow-lg border border-slate-700">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Cartão Bancário (Débito & Crédito)</h4>
                      <p className="text-[11px] text-slate-400">Visa, Mastercard e Redes Nacionais</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    100% Operacional
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    Aceita cartões emitidos por todos os bancos nacionais e internacionais:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {['Millennium BIM', 'BCI', 'Standard Bank', 'Moza Banco', 'Absa', 'Visa', 'Mastercard'].map((b) => (
                      <span key={b} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-lg text-[10.5px] font-semibold text-sky-200">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    E-mail para envio do recibo bancário:
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="o-seu-email@exemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-medium transition-colors"
                  />
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Proteção oficial 3D-Secure com certificação PCI-DSS.</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                id="btn-confirm-payment-init"
                onClick={handleInitiatePayment}
                className="btn-apple-3d w-full py-4 px-4 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 active:scale-[0.98] shadow-lg"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pagar {monthlyPriceMzn} MT com Cartão Bancário</span>
              </button>
            </>
          )}

          {stage === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
              <div>
                <h4 className="text-base font-bold text-[#0F172A]">A Iniciar Sessão Segura...</h4>
                <p className="text-xs text-[#64748B] mt-1">{statusMessage}</p>
              </div>
            </div>
          )}

          {stage === 'waiting_card' && (
            <div className="py-6 space-y-5 text-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto ring-8 ring-blue-50/50 animate-pulse">
                <CreditCard className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-[#0F172A]">
                  Concluir Pagamento com Cartão
                </h4>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
                  Clique no botão abaixo para abrir a página oficial 3D-Secure do banco e confirmar o pagamento com segurança máxima.
                </p>
              </div>

              {checkoutUrl && (
                <div className="py-2">
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-apple-3d inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Abrir Checkout Seguro</span>
                    <ExternalLink className="w-4 h-4 text-sky-300" />
                  </a>
                  <p className="text-[11px] text-[#64748B] mt-2.5 max-w-xs mx-auto">
                    Assim que autorizar o cartão no seu banco, o seu plano Pro será ativado automaticamente nesta página.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-[#64748B] pt-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>A aguardar confirmação em tempo real...</span>
              </div>
            </div>
          )}

          {stage === 'success' && (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <CheckCircle2 className="w-10 h-10 text-[#059669]" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xl font-black text-[#0F172A]">
                  Assinatura Mensal Ativada com Sucesso!
                </h4>
                <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                  O seu plano Pro está ativo por 30 dias na sua conta. Tem acesso ilimitado para descarregar o seu CV em PDF sem qualquer restrição.
                </p>
              </div>

              <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-2xl text-xs text-[#334155] font-medium max-w-sm mx-auto flex justify-between">
                <span>Ref. Transação:</span>
                <span className="font-mono font-bold text-[#0F172A]">{currentReference}</span>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  id="btn-download-pdf-success"
                  onClick={() => {
                    onDownloadPdfNow();
                    onClose();
                  }}
                  className="btn-apple-3d w-full py-3.5 px-4 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  Descarregar Ficheiro PDF Agora
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
                >
                  Fechar Janela
                </button>
              </div>
            </div>
          )}

          {stage === 'error' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-base font-bold text-[#0F172A]">Não Foi Possível Concluir o Pagamento</h4>
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-950 text-left leading-relaxed shadow-2xs">
                  <p className="font-semibold text-rose-900 mb-1">Informação do processamento:</p>
                  <p className="text-rose-800">{statusMessage}</p>
                </div>
              </div>

              <div className="pt-2 space-y-2.5 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setStage('select')}
                  className="btn-apple-3d w-full py-3.5 px-4 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <CreditCard className="w-4 h-4 text-sky-300" />
                  <span>Tentar Novamente com Cartão Bancário</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
