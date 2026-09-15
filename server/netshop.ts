/**
 * Netshop Mozambique Payment Gateway Integration
 * Official API v1: https://www.netshop.co.mz/api/v1
 * Supports M-Pesa (Vodacom), e-Mola (Movitel), mKesh (Tmcel) and Bank Cards.
 */

export interface NetshopInitiateRequest {
  reference: string;
  amount: number;
  currency?: string;
  paymentMethod: 'emola' | 'mpesa' | 'mkesh' | 'card';
  customerPhone?: string;
  customerEmail?: string;
  customerName?: string;
  callbackUrl?: string;
  cardDetails?: {
    cardNumber?: string;
    cardHolder?: string;
    expiry?: string;
    cvv?: string;
  };
}

export interface NetshopPaymentResponse {
  success: boolean;
  reference: string;
  transactionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  ussdPromptSent?: boolean;
  checkoutUrl?: string;
  rawResponse?: any;
}

export class NetshopService {
  public getApiKey(): string {
    return (process.env.NETSHOP_API_KEY || '').trim();
  }

  public getWalletId(): string {
    return (process.env.NETSHOP_WALLET_ID || '').trim();
  }

  public getBaseUrl(): string {
    let url = (process.env.NETSHOP_BASE_URL || 'https://www.netshop.co.mz/api/v1').replace(/\/$/, '');
    if (!url.includes('/api/v1') && !url.includes('/api')) {
      url = `${url}/api/v1`;
    }
    return url;
  }

  public getWebhookSecret(): string {
    return (process.env.NETSHOP_WEBHOOK_SECRET || '').trim();
  }

  public getStatus() {
    const apiKey = this.getApiKey();
    const walletId = this.getWalletId();
    const isValidWallet = /^\d{6}$/.test(walletId);

    return {
      configured: Boolean(apiKey && isValidWallet),
      apiKeyConfigured: Boolean(apiKey),
      walletIdConfigured: isValidWallet,
      walletIdRaw: walletId ? (walletId.length === 6 ? `${walletId.slice(0, 2)}**${walletId.slice(4)}` : 'Inválido') : 'Não definido',
      baseUrl: this.getBaseUrl(),
      isLive: Boolean(apiKey && !apiKey.startsWith('test_') && !apiKey.startsWith('ns_test_')),
      hasWebhookSecret: Boolean(this.getWebhookSecret()),
    };
  }

  /**
   * Ping de saúde da API Netshop
   */
  public async ping(): Promise<{ ok: boolean; message: string; data?: any }> {
    const apiKey = this.getApiKey();
    const walletId = this.getWalletId();
    const baseUrl = this.getBaseUrl();

    try {
      const headers: Record<string, string> = {};
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
      if (walletId) headers['X-Wallet-ID'] = walletId;

      const res = await fetch(`${baseUrl}/ping`, {
        method: 'GET',
        headers,
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (res.ok) {
        return { ok: true, message: 'Ligação com a API da NetShop estabelecida com sucesso.', data };
      } else {
        return { ok: false, message: `Erro no ping da NetShop (${res.status}): ${text.slice(0, 120)}`, data };
      }
    } catch (e: any) {
      return { ok: false, message: `Falha ao contactar ${baseUrl}/ping: ${e?.message}` };
    }
  }

  /**
   * Normaliza números de telefone de Moçambique para formato internacional com prefixo '+' (+258...)
   * O gateway Netshop requer o formato '+2588XXXXXXXX' para o campo 'msisdn'.
   */
  public normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('258') && digits.length === 12) {
      return `+${digits}`;
    }
    if (digits.length === 9) {
      return `+258${digits}`;
    }
    if (phone.startsWith('+258') && digits.length === 12) {
      return phone;
    }
    return `+258${digits.slice(-9)}`;
  }

  /**
   * Identifica a operadora móvel com base no prefixo moçambicano:
   * 84/85 = M-Pesa (Vodacom)
   * 86/87 = e-Mola (Movitel)
   * 82/83 = mKesh (Tmcel)
   */
  public detectOperator(phone: string): 'mpesa' | 'emola' | 'mkesh' | 'unknown' {
    const digits = phone.replace(/\D/g, '');
    const local = digits.startsWith('258') ? digits.slice(3) : digits;
    const prefix = local.slice(0, 2);

    if (prefix === '84' || prefix === '85') return 'mpesa';
    if (prefix === '86' || prefix === '87') return 'emola';
    if (prefix === '82' || prefix === '83') return 'mkesh';
    return 'unknown';
  }

  /**
   * Inicia cobrança na API Netshop (POST /charges)
   */
  public async initiatePayment(req: NetshopInitiateRequest): Promise<NetshopPaymentResponse> {
    const apiKey = this.getApiKey();
    const walletId = this.getWalletId();
    const baseUrl = this.getBaseUrl();
    const reference = req.reference || `CV-${Date.now().toString(36).toUpperCase()}`;

    // 1. Verificação de credenciais obrigatórias
    if (!apiKey) {
      return {
        success: false,
        reference,
        transactionId: '',
        status: 'failed',
        message: 'A chave de API da NetShop (NETSHOP_API_KEY) não está configurada nas definições do servidor.',
        ussdPromptSent: false,
      };
    }

    if (!walletId) {
      return {
        success: false,
        reference,
        transactionId: '',
        status: 'failed',
        message: 'A Wallet ID da NetShop (NETSHOP_WALLET_ID) é obrigatória. Aceda a netshop.co.mz/app/definicoes (ou ao canto superior direito do painel Netshop) e configure a sua Wallet ID de 6 dígitos.',
        ussdPromptSent: false,
      };
    }

    if (!/^\d{6}$/.test(walletId)) {
      return {
        success: false,
        reference,
        transactionId: '',
        status: 'failed',
        message: `A Wallet ID configurada (${walletId}) é inválida. A NetShop requer um código de comerciante de exatamente 6 dígitos numéricos.`,
        ussdPromptSent: false,
      };
    }

    const endpoint = `${baseUrl}/charges`;

    // 2. Preparação dos dados de cobrança
    const phone = req.customerPhone ? this.normalizePhone(req.customerPhone) : '';
    const chargePayload: Record<string, any> = {
      amount: req.amount,
      currency: req.currency || 'MZN',
      method: req.paymentMethod,
      reference,
      customer_email: req.customerEmail || 'cliente@cv.co.mz',
      return_url: req.callbackUrl || `${process.env.APP_URL || ''}/api/payments/return`,
      metadata: {
        plan: 'pro_monthly',
        customer_name: req.customerName || 'Cliente CV Pro',
        reference,
      },
    };

    // Para carteiras móveis (mpesa, emola, mkesh), o msisdn é estritamente obrigatório
    if (req.paymentMethod !== 'card') {
      chargePayload.msisdn = phone;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-Wallet-ID': walletId,
      'Idempotency-Key': reference,
    };

    console.log(`[Netshop Live API] POST ${endpoint} (Método: ${req.paymentMethod}, Wallet ID: ${walletId}, Ref: ${reference})`);

    try {
      // Timeout otimizado: 12 segundos para carteiras móveis (evita bloqueio longo se a Vodacom/Tmcel pendurar) e 15s para cartões
      const timeoutMs = req.paymentMethod === 'card' ? 15000 : 12000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(chargePayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }

      if (response.ok) {
        const isPaid = data.status === 'paid' || data.status === 'completed' || data.status === 'success';
        const checkoutUrl = data.checkout?.hosted_url || data.checkout_url || data.payment_url;

        let userMsg = '';
        if (req.paymentMethod === 'card' && checkoutUrl) {
          userMsg = 'Sessão segura de cartão iniciada. Redirecionando para a página da NetShop/BIM...';
        } else if (isPaid) {
          userMsg = 'Pagamento confirmado com sucesso!';
        } else {
          userMsg = `Pedido USSD enviado para ${phone}. Confirme a transação inserindo o PIN no telemóvel.`;
        }

        return {
          success: true,
          reference,
          transactionId: data.id || `ch_${Date.now()}`,
          status: isPaid ? 'completed' : 'processing',
          message: userMsg,
          ussdPromptSent: req.paymentMethod !== 'card',
          checkoutUrl,
          rawResponse: data,
        };
      } else {
        // A NetShop devolve HTTP 422 quando uma cobrança é rejeitada pelo provedor móvel (ex: conta não autorizada, saldo insuficiente, etc.)
        // Nesses casos, o corpo da resposta já é o objeto da cobrança com status: "failed", e os detalhes estão em failed_reason ou provider.responseDesc
        let failedReason = data.failed_reason || data.provider?.responseDesc || data.provider?.responseCode || data.detail || data.message || data.error;

        // Se o failed_reason vier vazio mas tivermos um id, tentar consultar /charges/{id} para obter a razão exata do provedor
        if (data.id && (!failedReason || failedReason === 'failed')) {
          try {
            const check = await this.checkPaymentStatus(data.id);
            if (check.raw?.failed_reason || check.raw?.provider?.responseDesc) {
              failedReason = check.raw.failed_reason || check.raw.provider.responseDesc;
            }
          } catch {}
        }

        console.warn(`[Netshop Live API Resposta de Rejeição ${response.status}]:`, {
          id: data.id,
          method: req.paymentMethod,
          status: data.status,
          failedReason: failedReason || responseText
        });

        // Tratamento elegante e amigável para o utilizador
        let friendlyMsg = failedReason;

        if (response.status === 401 && (String(failedReason).includes('wallet') || data.error === 'missing_or_invalid_wallet_id')) {
          friendlyMsg = 'Wallet ID inválida ou em falta na NetShop. Verifique a Wallet ID de 6 dígitos no seu painel da NetShop.';
        } else if (data.error === 'method_disabled') {
          friendlyMsg = data.detail || `O método ${req.paymentMethod.toUpperCase()} está temporariamente indisponível no gateway da NetShop.`;
        } else if (failedReason && typeof failedReason === 'string') {
          if (failedReason.includes('não está autorizado')) {
            friendlyMsg = `O seu número (${phone}) não tem autorização ativa para transações ${req.paymentMethod.toUpperCase()} no operador. Recomendamos usar M-Pesa (Vodacom), e-Mola (Movitel) ou Cartão Bancário.`;
          } else if (failedReason.toLowerCase().includes('saldo') || failedReason.toLowerCase().includes('insufficient')) {
            friendlyMsg = `Saldo insuficiente na sua conta ${req.paymentMethod.toUpperCase()} para o valor de ${req.amount} MT.`;
          } else if (failedReason.toLowerCase().includes('pin') || failedReason.toLowerCase().includes('cancelado')) {
            friendlyMsg = 'A transação foi cancelada ou o PIN introduzido não estava correto.';
          } else if (failedReason.toLowerCase().includes('timeout') || failedReason.toLowerCase().includes('expirou')) {
            friendlyMsg = 'O tempo para confirmação do PIN na operadora expirou. Por favor tente novamente.';
          }
        }

        return {
          success: false,
          reference,
          transactionId: data.id || '',
          status: 'failed',
          message: friendlyMsg || `Cobrança recusada pelo operador: ${responseText.slice(0, 140)}`,
          ussdPromptSent: false,
          rawResponse: data,
        };
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const methodUpper = req.paymentMethod.toUpperCase();
        return {
          success: false,
          reference,
          transactionId: '',
          status: 'failed',
          message: `A operadora (${methodUpper}) não respondeu no tempo limite da NetShop devido a instabilidade na rede móvel. Por favor utilize Cartão Bancário (Visa / Mastercard / BIM), que está 100% operacional.`,
          ussdPromptSent: false,
        };
      }

      console.warn('[Netshop Connection Error]:', err?.message || err);
      return {
        success: false,
        reference,
        transactionId: '',
        status: 'failed',
        message: `Falha ao contactar a API da NetShop: ${err?.message || 'Verifique a sua ligação de rede.'}`,
        ussdPromptSent: false,
      };
    }
  }

  /**
   * Consulta o estado de um pagamento na API Netshop (GET /charges/{id})
   */
  public async checkPaymentStatus(chargeIdOrRef: string): Promise<{ status: string; message: string; raw?: any }> {
    const apiKey = this.getApiKey();
    const walletId = this.getWalletId();
    const baseUrl = this.getBaseUrl();

    if (!apiKey || !walletId) {
      return { status: 'processing', message: 'Aguardando validação do operador...' };
    }

    try {
      const response = await fetch(`${baseUrl}/charges/${chargeIdOrRef}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Wallet-ID': walletId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const status = data.status === 'paid' ? 'completed' : data.status === 'failed' ? 'failed' : 'processing';
        const failReason = data.failed_reason || data.provider?.responseDesc || 'Cobrança não autorizada pelo operador móvel.';
        return {
          status,
          message: status === 'completed' 
            ? 'Pagamento confirmado!' 
            : status === 'failed' 
              ? failReason 
              : 'A aguardar confirmação do operador...',
          raw: data,
        };
      }
    } catch (err: any) {
      console.warn('[Netshop Status Check Error]:', err?.message);
    }

    return {
      status: 'processing',
      message: 'A aguardar confirmação no telemóvel...',
    };
  }
}

export const netshop = new NetshopService();

