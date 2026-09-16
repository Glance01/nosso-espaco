// server/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// server/netshop.ts
var NetshopService = class {
  getApiKey() {
    return (process.env.NETSHOP_API_KEY || "").trim();
  }
  getWalletId() {
    return (process.env.NETSHOP_WALLET_ID || "").trim();
  }
  getBaseUrl() {
    let url = (process.env.NETSHOP_BASE_URL || "https://www.netshop.co.mz/api/v1").replace(/\/$/, "");
    if (!url.includes("/api/v1") && !url.includes("/api")) {
      url = `${url}/api/v1`;
    }
    return url;
  }
  getWebhookSecret() {
    return (process.env.NETSHOP_WEBHOOK_SECRET || "").trim();
  }
  getStatus() {
    const apiKey = this.getApiKey();
    const walletId = this.getWalletId();
    const isValidWallet = /^\d{6}$/.test(walletId);
    return {
      configured: Boolean(apiKey && isValidWallet),
      apiKeyConfigured: Boolean(apiKey),
      walletIdConfigured: isValidWallet,
      walletIdRaw: walletId ? walletId.length === 6 ? `${walletId.slice(0, 2)}**${walletId.slice(4)}` : "Inv\xE1lido" : "N\xE3o definido",
      baseUrl: this.getBaseUrl(),
      isLive: Boolean(apiKey && !apiKey.startsWith("test_") && !apiKey.startsWith("ns_test_")),
      hasWebhookSecret: Boolean(this.getWebhookSecret())
    };
  }
  /**
   * Ping de saúde da API Netshop
   */
  async ping() {
    const apiKey = this.getApiKey();
    const walletId = this.getWalletId();
    const baseUrl = this.getBaseUrl();
    try {
      const headers = {};
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
      if (walletId) headers["X-Wallet-ID"] = walletId;
      const res = await fetch(`${baseUrl}/ping`, {
        method: "GET",
        headers
      });
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
      if (res.ok) {
        return { ok: true, message: "Liga\xE7\xE3o com a API da NetShop estabelecida com sucesso.", data };
      } else {
        return { ok: false, message: `Erro no ping da NetShop (${res.status}): ${text.slice(0, 120)}`, data };
      }
    } catch (e) {
      return { ok: false, message: `Falha ao contactar ${baseUrl}/ping: ${e?.message}` };
    }
  }
  /**
   * Normaliza números de telefone de Moçambique para formato internacional com prefixo '+' (+258...)
   * O gateway Netshop requer o formato '+2588XXXXXXXX' para o campo 'msisdn'.
   */
  normalizePhone(phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("258") && digits.length === 12) {
      return `+${digits}`;
    }
    if (digits.length === 9) {
      return `+258${digits}`;
    }
    if (phone.startsWith("+258") && digits.length === 12) {
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
  detectOperator(phone) {
    const digits = phone.replace(/\D/g, "");
    const local = digits.startsWith("258") ? digits.slice(3) : digits;
    const prefix = local.slice(0, 2);
    if (prefix === "84" || prefix === "85") return "mpesa";
    if (prefix === "86" || prefix === "87") return "emola";
    if (prefix === "82" || prefix === "83") return "mkesh";
    return "unknown";
  }
  /**
   * Inicia cobrança na API Netshop (POST /charges)
   */
  async initiatePayment(req) {
    const apiKey = this.getApiKey();
    const walletId = this.getWalletId();
    const baseUrl = this.getBaseUrl();
    const reference = req.reference || `CV-${Date.now().toString(36).toUpperCase()}`;
    if (!apiKey) {
      return {
        success: false,
        reference,
        transactionId: "",
        status: "failed",
        message: "A chave de API da NetShop (NETSHOP_API_KEY) n\xE3o est\xE1 configurada nas defini\xE7\xF5es do servidor.",
        ussdPromptSent: false
      };
    }
    if (!walletId) {
      return {
        success: false,
        reference,
        transactionId: "",
        status: "failed",
        message: "A Wallet ID da NetShop (NETSHOP_WALLET_ID) \xE9 obrigat\xF3ria. Aceda a netshop.co.mz/app/definicoes (ou ao canto superior direito do painel Netshop) e configure a sua Wallet ID de 6 d\xEDgitos.",
        ussdPromptSent: false
      };
    }
    if (!/^\d{6}$/.test(walletId)) {
      return {
        success: false,
        reference,
        transactionId: "",
        status: "failed",
        message: `A Wallet ID configurada (${walletId}) \xE9 inv\xE1lida. A NetShop requer um c\xF3digo de comerciante de exatamente 6 d\xEDgitos num\xE9ricos.`,
        ussdPromptSent: false
      };
    }
    const endpoint = `${baseUrl}/charges`;
    const phone = req.customerPhone ? this.normalizePhone(req.customerPhone) : "";
    const chargePayload = {
      amount: req.amount,
      currency: req.currency || "MZN",
      method: req.paymentMethod,
      reference,
      customer_email: req.customerEmail || "cliente@cv.co.mz",
      return_url: req.callbackUrl || `${process.env.APP_URL || ""}/api/payments/return`,
      metadata: {
        plan: "pro_monthly",
        customer_name: req.customerName || "Cliente CV Pro",
        reference
      }
    };
    if (req.paymentMethod !== "card") {
      chargePayload.msisdn = phone;
    }
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "X-Wallet-ID": walletId,
      "Idempotency-Key": reference
    };
    console.log(`[Netshop Live API] POST ${endpoint} (M\xE9todo: ${req.paymentMethod}, Wallet ID: ${walletId}, Ref: ${reference})`);
    try {
      const timeoutMs = req.paymentMethod === "card" ? 15e3 : 12e3;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(chargePayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const responseText = await response.text();
      let data = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }
      if (response.ok) {
        const isPaid = data.status === "paid" || data.status === "completed" || data.status === "success";
        const checkoutUrl = data.checkout?.hosted_url || data.checkout_url || data.payment_url;
        let userMsg = "";
        if (req.paymentMethod === "card" && checkoutUrl) {
          userMsg = "Sess\xE3o segura de cart\xE3o iniciada. Redirecionando para a p\xE1gina da NetShop/BIM...";
        } else if (isPaid) {
          userMsg = "Pagamento confirmado com sucesso!";
        } else {
          userMsg = `Pedido USSD enviado para ${phone}. Confirme a transa\xE7\xE3o inserindo o PIN no telem\xF3vel.`;
        }
        return {
          success: true,
          reference,
          transactionId: data.id || `ch_${Date.now()}`,
          status: isPaid ? "completed" : "processing",
          message: userMsg,
          ussdPromptSent: req.paymentMethod !== "card",
          checkoutUrl,
          rawResponse: data
        };
      } else {
        let failedReason = data.failed_reason || data.provider?.responseDesc || data.provider?.responseCode || data.detail || data.message || data.error;
        if (data.id && (!failedReason || failedReason === "failed")) {
          try {
            const check = await this.checkPaymentStatus(data.id);
            if (check.raw?.failed_reason || check.raw?.provider?.responseDesc) {
              failedReason = check.raw.failed_reason || check.raw.provider.responseDesc;
            }
          } catch {
          }
        }
        console.warn(`[Netshop Live API Resposta de Rejei\xE7\xE3o ${response.status}]:`, {
          id: data.id,
          method: req.paymentMethod,
          status: data.status,
          failedReason: failedReason || responseText
        });
        let friendlyMsg = failedReason;
        if (response.status === 401 && (String(failedReason).includes("wallet") || data.error === "missing_or_invalid_wallet_id")) {
          friendlyMsg = "Wallet ID inv\xE1lida ou em falta na NetShop. Verifique a Wallet ID de 6 d\xEDgitos no seu painel da NetShop.";
        } else if (data.error === "method_disabled") {
          friendlyMsg = data.detail || `O m\xE9todo ${req.paymentMethod.toUpperCase()} est\xE1 temporariamente indispon\xEDvel no gateway da NetShop.`;
        } else if (failedReason && typeof failedReason === "string") {
          if (failedReason.includes("n\xE3o est\xE1 autorizado")) {
            friendlyMsg = `O seu n\xFAmero (${phone}) n\xE3o tem autoriza\xE7\xE3o ativa para transa\xE7\xF5es ${req.paymentMethod.toUpperCase()} no operador. Recomendamos usar M-Pesa (Vodacom), e-Mola (Movitel) ou Cart\xE3o Banc\xE1rio.`;
          } else if (failedReason.toLowerCase().includes("saldo") || failedReason.toLowerCase().includes("insufficient")) {
            friendlyMsg = `Saldo insuficiente na sua conta ${req.paymentMethod.toUpperCase()} para o valor de ${req.amount} MT.`;
          } else if (failedReason.toLowerCase().includes("pin") || failedReason.toLowerCase().includes("cancelado")) {
            friendlyMsg = "A transa\xE7\xE3o foi cancelada ou o PIN introduzido n\xE3o estava correto.";
          } else if (failedReason.toLowerCase().includes("timeout") || failedReason.toLowerCase().includes("expirou")) {
            friendlyMsg = "O tempo para confirma\xE7\xE3o do PIN na operadora expirou. Por favor tente novamente.";
          }
        }
        return {
          success: false,
          reference,
          transactionId: data.id || "",
          status: "failed",
          message: friendlyMsg || `Cobran\xE7a recusada pelo operador: ${responseText.slice(0, 140)}`,
          ussdPromptSent: false,
          rawResponse: data
        };
      }
    } catch (err) {
      if (err.name === "AbortError") {
        const methodUpper = req.paymentMethod.toUpperCase();
        return {
          success: false,
          reference,
          transactionId: "",
          status: "failed",
          message: `A operadora (${methodUpper}) n\xE3o respondeu no tempo limite da NetShop devido a instabilidade na rede m\xF3vel. Por favor utilize Cart\xE3o Banc\xE1rio (Visa / Mastercard / BIM), que est\xE1 100% operacional.`,
          ussdPromptSent: false
        };
      }
      console.warn("[Netshop Connection Error]:", err?.message || err);
      return {
        success: false,
        reference,
        transactionId: "",
        status: "failed",
        message: `Falha ao contactar a API da NetShop: ${err?.message || "Verifique a sua liga\xE7\xE3o de rede."}`,
        ussdPromptSent: false
      };
    }
  }
  /**
   * Consulta o estado de um pagamento na API Netshop (GET /charges/{id})
   */
  async checkPaymentStatus(chargeIdOrRef) {
    const apiKey = this.getApiKey();
    const walletId = this.getWalletId();
    const baseUrl = this.getBaseUrl();
    if (!apiKey || !walletId) {
      return { status: "processing", message: "Aguardando valida\xE7\xE3o do operador..." };
    }
    try {
      const response = await fetch(`${baseUrl}/charges/${chargeIdOrRef}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "X-Wallet-ID": walletId
        }
      });
      if (response.ok) {
        const data = await response.json();
        const status = data.status === "paid" ? "completed" : data.status === "failed" ? "failed" : "processing";
        const failReason = data.failed_reason || data.provider?.responseDesc || "Cobran\xE7a n\xE3o autorizada pelo operador m\xF3vel.";
        return {
          status,
          message: status === "completed" ? "Pagamento confirmado!" : status === "failed" ? failReason : "A aguardar confirma\xE7\xE3o do operador...",
          raw: data
        };
      }
    } catch (err) {
      console.warn("[Netshop Status Check Error]:", err?.message);
    }
    return {
      status: "processing",
      message: "A aguardar confirma\xE7\xE3o no telem\xF3vel..."
    };
  }
};
var netshop = new NetshopService();

// server/gemini.ts
import { GoogleGenAI } from "@google/genai";

// src/data/initialData.ts
var initialCVData = {
  personal: {
    fullName: "Ars\xE9nio Mabunda",
    jobTitle: "Engenheiro de Software S\xE9nior & L\xEDder T\xE9cnico",
    email: "arsenio.mabunda@exemplo.co.mz",
    phone: "+258 84 123 4567",
    location: "Maputo, Mo\xE7ambique",
    website: "https://arsenio.dev",
    linkedin: "linkedin.com/in/arsenio-mabunda",
    github: "github.com/arsenio-mz",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    summary: "Engenheiro de Software S\xE9nior com mais de 7 anos de experi\xEAncia na arquitetura e desenvolvimento de aplica\xE7\xF5es web escal\xE1veis e integra\xE7\xE3o de sistemas financeiros em Mo\xE7ambique. Comprovada capacidade em lideran\xE7a t\xE9cnica de equipas multidisciplinares, otimiza\xE7\xE3o de performance em 40% e implementa\xE7\xE3o rigorosa de padr\xF5es de seguran\xE7a e conformidade para o setor banc\xE1rio e corporativo."
  },
  experiences: [
    {
      id: "exp-1",
      role: "Lead Full-Stack Engineer & Arquiteto de Software",
      company: "Tech Solutions Mo\xE7ambique",
      location: "Maputo, Mo\xE7ambique",
      startDate: "2022-03",
      endDate: "",
      current: true,
      description: "\u2022 Liderou equipa de 8 engenheiros no redesenho da plataforma core de pagamentos, reduzindo o tempo de transa\xE7\xE3o em 35%.\n\u2022 Implementou integra\xE7\xF5es seguras com gateways de pagamento m\xF3vel (M-Pesa, e-Mola) e sistemas banc\xE1rios.\n\u2022 Coordenou sprints em metodologia Scrum, garantindo entrega cont\xEDnua e alinhamento estrat\xE9gico com stakeholders."
    },
    {
      id: "exp-2",
      role: "Desenvolvedor Web S\xE9nior",
      company: "Inova\xE7\xF5es Digitais Lda",
      location: "Matola, Mo\xE7ambique",
      startDate: "2019-01",
      endDate: "2022-02",
      current: false,
      description: "\u2022 Desenvolveu portais corporativos de alta disponibilidade utilizando React, TypeScript e microsservi\xE7os Node.js.\n\u2022 Otimizou consultas em bases de dados relacionais (PostgreSQL), elevando a velocidade de resposta das plataformas em 45%.\n\u2022 Ministrou forma\xE7\xE3o t\xE9cnica interna sobre boas pr\xE1ticas de c\xF3digo limpo e testes automatizados."
    },
    {
      id: "exp-3",
      role: "Programador J\xFAnior & Suporte de Sistemas",
      company: "Byte MZ Inform\xE1tica",
      location: "Maputo",
      startDate: "2017-08",
      endDate: "2018-12",
      current: false,
      description: "\u2022 Projetou interfaces de utilizador responsivas e eficientes para clientes dos setores de retalho e educa\xE7\xE3o.\n\u2022 Prestou suporte t\xE9cnico especializado a infraestruturas de rede e resolu\xE7\xE3o de incidentes cr\xEDticos."
    }
  ],
  educations: [
    {
      id: "edu-1",
      degree: "Licenciatura em Engenharia Inform\xE1tica",
      institution: "Universidade Eduardo Mondlane (UEM)",
      location: "Maputo",
      startDate: "2014-02",
      endDate: "2018-11",
      current: false,
      description: "Especializa\xE7\xE3o em Sistemas Distribu\xEDdos e Engenharia de Software. Conclus\xE3o com distin\xE7\xE3o acad\xE9mica (M\xE9dia: 16/20)."
    },
    {
      id: "edu-2",
      degree: "P\xF3s-Gradua\xE7\xE3o em Gest\xE3o de Projetos Tecnol\xF3gicos",
      institution: "Instituto Superior de Transportes e Comunica\xE7\xF5es (ISUTC)",
      location: "Maputo",
      startDate: "2020-03",
      endDate: "2021-06",
      current: false,
      description: "Foco em governa\xE7\xE3o de TI, metodologias \xE1geis (Scrum Master) e gest\xE3o or\xE7amental de projetos."
    }
  ],
  skills: [
    { id: "sk-1", name: "Arquitetura de Software & Microsservi\xE7os", level: 5 },
    { id: "sk-2", name: "TypeScript / React / Next.js", level: 5 },
    { id: "sk-3", name: "Node.js & Express / NestJS", level: 5 },
    { id: "sk-4", name: "Integra\xE7\xE3o de Pagamentos (M-Pesa / Cart\xF5es)", level: 5 },
    { id: "sk-5", name: "PostgreSQL & Base de Dados", level: 4 },
    { id: "sk-6", name: "Docker, CI/CD & DevOps", level: 4 },
    { id: "sk-7", name: "Gest\xE3o de Equipas \xC1geis (Scrum)", level: 5 }
  ],
  languages: [
    { id: "lang-1", name: "Portugu\xEAs", proficiency: "Nativo" },
    { id: "lang-2", name: "Ingl\xEAs", proficiency: "Fluente" },
    { id: "lang-3", name: "Changana", proficiency: "Nativo" }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect \u2013 Associate",
      issuer: "Amazon Web Services",
      date: "2023-05"
    },
    {
      id: "cert-2",
      name: "Professional Scrum Master (PSM I)",
      issuer: "Scrum.org",
      date: "2022-09"
    }
  ]
};

// server/gemini.ts
var aiClient = null;
function getAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    } catch (e) {
      console.warn("Failed to initialize GoogleGenAI:", e);
    }
  }
  return aiClient;
}
async function generateWithFallback(ai, prompt) {
  const models = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError = null;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt
      });
      if (response.text?.trim()) {
        return response.text.trim();
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Fallback] Model ${model} failed, trying next:`, err?.message || err);
    }
  }
  throw lastError;
}
async function improveSummaryWithAI(params) {
  const ai = getAI();
  if (!ai) {
    return "Profissional dedicado e proativo, com s\xF3lida trajet\xF3ria na execu\xE7\xE3o de projetos de alto impacto, lideran\xE7a colaborativa e foco cont\xEDnuo em inova\xE7\xE3o, efici\xEAncia e resultados estrat\xE9gicos.";
  }
  try {
    const prompt = `Voc\xEA \xE9 um especialista s\xE9nior em recrutamento e elabora\xE7\xE3o de curr\xEDculos para o mercado lus\xF3fono e mo\xE7ambicano.
Melhore ou reescreva o seguinte Resumo Profissional / Perfil para torn\xE1-lo altamente persuasivo, elegante, focado em realiza\xE7\xF5es e impacto.

Cargo/T\xEDtulo: ${params.jobTitle || "Profissional"}
Compet\xEAncias-chave: ${params.skills.join(", ") || "Gest\xE3o, Lideran\xE7a, Comunica\xE7\xE3o"}
Resumo Atual: ${params.currentSummary || "Sem resumo"}

Diretrizes:
- Responda apenas com o texto melhorado em Portugu\xEAs (sem introdu\xE7\xF5es, sem aspas e sem explica\xE7\xF5es).
- Escreva entre 3 a 5 frases fluidas, impactantes e profissionais.
- Adapte para o mercado de trabalho moderno.`;
    const text = await generateWithFallback(ai, prompt);
    return text || params.currentSummary;
  } catch (error) {
    console.error("Error calling Gemini for summary:", error?.message);
    return params.currentSummary || "Profissional experiente e orientado a resultados, com comprovada capacidade de entrega em ambientes din\xE2micos.";
  }
}
async function suggestSkillsWithAI(jobTitle) {
  const ai = getAI();
  if (!ai) {
    return ["Comunica\xE7\xE3o Interpessoal", "Lideran\xE7a de Equipas", "Resolu\xE7\xE3o de Problemas", "Gest\xE3o de Tempo", "Metodologias \xC1geis"];
  }
  try {
    const prompt = `Gere uma lista JSON contendo as 6 principais compet\xEAncias t\xE9cnicas e comportamentais mais valorizadas para a profiss\xE3o: "${jobTitle}".
Retorne APENAS um array JSON de strings no formato: ["Compet\xEAncia 1", "Compet\xEAncia 2", ...]. Sem blocos de c\xF3digo adicionais.`;
    const text = await generateWithFallback(ai, prompt);
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return ["Gest\xE3o de Projetos", "Comunica\xE7\xE3o Estrat\xE9gica", "Resolu\xE7\xE3o de Problemas Complexos", "Inova\xE7\xE3o e Processos", "Trabalho em Equipa"];
  }
}
async function generateCoverLetterWithAI(params) {
  const ai = getAI();
  const defaultLetter = {
    recipientName: params.recipientName || "Diretor de Recursos Humanos",
    companyName: params.companyName || "Empresa em Mo\xE7ambique",
    companyAddress: "Maputo, Mo\xE7ambique",
    positionApplied: params.jobTitle || params.careerField,
    salutation: `Exmo(a). Sr(a). ${params.recipientName || "Diretor de Recursos Humanos"},`,
    openingParagraph: `Venho por meio desta demonstrar o meu vivo interesse na vaga de ${params.jobTitle || params.careerField} na ${params.companyName || "vosso prestigiado quadro"}, motivado(a) pela reputa\xE7\xE3o de excel\xEAncia e inova\xE7\xE3o da institui\xE7\xE3o no mercado mo\xE7ambicano.`,
    bodyParagraph1: `Com s\xF3lido percurso profissional na \xE1rea de ${params.careerField}, desenvolvi compet\xEAncias avan\xE7adas em gest\xE3o de projetos, resolu\xE7\xE3o de problemas complexos e entrega de resultados de alto impacto alinhados aos padr\xF5es exigidos pelo mercado corporativo nacional.`,
    bodyParagraph2: `A minha experi\xEAncia anterior permitiu-me liderar equipas multidisciplinares, otimizar processos operacionais e garantir rigor e conformidade regulat\xF3ria. Acredito que o meu perfil t\xE9cnico e proativo agregar\xE1 valor imediato aos vossos objetivos estrat\xE9gicos.`,
    closingParagraph: `Agrade\xE7o desde j\xE1 a aten\xE7\xE3o dispensada \xE0 minha candidatura e manifesto total disponibilidade para uma entrevista, onde terei todo o gosto em detalhar as minhas qualifica\xE7\xF5es e contributos potenciais.`,
    signOff: `Com os melhores cumprimentos,
${params.fullName || "Profissional"}`
  };
  if (!ai) {
    return defaultLetter;
  }
  try {
    const prompt = `Voc\xEA \xE9 um consultor s\xE9nior de carreira em Mo\xE7ambique. Escreva uma Carta de Apresenta\xE7\xE3o e Motiva\xE7\xE3o altamente profissional, formal e persuasiva em Portugu\xEAs de Mo\xE7ambique para um candidato candidatar-se a um emprego.
Dados do Candidato:
- Nome: ${params.fullName}
- \xC1rea/Profiss\xE3o: ${params.careerField}
- Cargo Pretendido: ${params.jobTitle}
- Empresa Destino: ${params.companyName}
- Destinat\xE1rio: ${params.recipientName}
- Resumo da Experi\xEAncia: ${params.experienceSummary}

Retorne APENAS um objeto JSON v\xE1lido (sem markdown, sem texto adicional) com esta estrutura exata:
{
  "recipientName": "${params.recipientName}",
  "companyName": "${params.companyName}",
  "companyAddress": "Maputo, Mo\xE7ambique",
  "positionApplied": "${params.jobTitle}",
  "salutation": "Exmo(a). Sr(a)...",
  "openingParagraph": "Par\xE1grafo de introdu\xE7\xE3o...",
  "bodyParagraph1": "Primeiro par\xE1grafo de desenvolvimento destacando compet\xEAncias e valor...",
  "bodyParagraph2": "Segundo par\xE1grafo de desenvolvimento destacando resultados e alinhamento com a empresa...",
  "closingParagraph": "Par\xE1grafo de fecho demonstrando entusiasmo pela entrevista...",
  "signOff": "Com os melhores cumprimentos,
[Nome]"
}`;
    const text = await generateWithFallback(ai, prompt);
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { ...defaultLetter, ...parsed };
  } catch (e) {
    console.error("Error generating cover letter with AI:", e);
    return defaultLetter;
  }
}
async function generateTailoredResumeWithAI(params) {
  const ai = getAI();
  if (!ai) {
    return {
      ...initialCVData,
      personal: {
        ...initialCVData.personal,
        fullName: params.fullName || "Profissional Exemplar",
        jobTitle: `${params.careerField} Especialista`,
        email: params.email,
        phone: params.phone,
        location: params.location || "Maputo, Mo\xE7ambique"
      }
    };
  }
  try {
    const prompt = `Voc\xEA \xE9 um especialista s\xE9nior em recrutamento e RH em Mo\xE7ambique.
Gere um modelo de curr\xEDculo profissional completo e adaptado para a profiss\xE3o/\xE1rea: "${params.careerField}" (N\xEDvel: "${params.experienceLevel}", Localiza\xE7\xE3o: "${params.location || "Maputo, Mo\xE7ambique"}", Nome: "${params.fullName}", E-mail: "${params.email}", Telefone: "${params.phone}").

Retorne APENAS um objeto JSON v\xE1lido (sem texto antes ou depois, sem crases de markdown) com exatamente esta estrutura de dados:
{
  "personal": {
    "fullName": "${params.fullName}",
    "jobTitle": "Cargo profissional ideal para ${params.careerField}",
    "email": "${params.email}",
    "phone": "${params.phone}",
    "location": "${params.location || "Maputo, Mo\xE7ambique"}",
    "website": "",
    "linkedin": "",
    "github": "",
    "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    "summary": "Resumo profissional de 3 a 4 frases destacando compet\xEAncias e impacto em ${params.careerField} no mercado de Mo\xE7ambique."
  },
  "experiences": [
    {
      "id": "exp-1",
      "role": "Cargo S\xE9nior / Coordenador",
      "company": "Empresa de Refer\xEAncia em Mo\xE7ambique",
      "location": "${params.location || "Maputo"}",
      "startDate": "2021-01",
      "endDate": "",
      "current": true,
      "description": "Responsabilidades e realiza\xE7\xF5es de destaque na \xE1rea de ${params.careerField}."
    },
    {
      "id": "exp-2",
      "role": "Profissional de ${params.careerField}",
      "company": "Organiza\xE7\xE3o Nacional",
      "location": "${params.location || "Maputo"}",
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
      "institution": "Universidade em Mo\xE7ambique",
      "location": "${params.location || "Maputo"}",
      "startDate": "2014-02",
      "endDate": "2017-11",
      "current": false,
      "description": "Forma\xE7\xE3o acad\xE9mica superior na \xE1rea."
    }
  ],
  "skills": [
    { "id": "sk-1", "name": "Compet\xEAncia 1 relevante para ${params.careerField}", "level": 5 },
    { "id": "sk-2", "name": "Compet\xEAncia 2 relevante", "level": 5 },
    { "id": "sk-3", "name": "Compet\xEAncia 3 relevante", "level": 4 },
    { "id": "sk-4", "name": "Compet\xEAncia 4 relevante", "level": 4 },
    { "id": "sk-5", "name": "Compet\xEAncia 5 relevante", "level": 4 }
  ],
  "languages": [
    { "id": "lang-1", "name": "Portugu\xEAs", "proficiency": "Nativo" },
    { "id": "lang-2", "name": "Ingl\xEAs", "proficiency": "Fluente" }
  ],
  "certifications": [
    { "id": "cert-1", "name": "Certifica\xE7\xE3o Profissional em ${params.careerField}", "issuer": "Institui\xE7\xE3o Reconhecida", "date": "2022-06" }
  ]
}`;
    const text = await generateWithFallback(ai, prompt);
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (e) {
    console.error("Error generating tailored CV with AI:", e);
    return {
      ...initialCVData,
      personal: {
        ...initialCVData.personal,
        fullName: params.fullName || "Profissional",
        jobTitle: `${params.careerField} Especialista`,
        email: params.email,
        phone: params.phone,
        location: params.location || "Maputo, Mo\xE7ambique"
      }
    };
  }
}

// server/app.ts
dotenv.config();
var app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
var transactions = /* @__PURE__ */ new Map();
var webhookLogs = [];
var subscribers = /* @__PURE__ */ new Map();
var apiRouter = express.Router();
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Candidate-se",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    netshopConfigured: Boolean(process.env.NETSHOP_API_KEY)
  });
});
apiRouter.get("/config", (req, res) => {
  const netshopStatus = netshop.getStatus();
  const monthlyPrice = parseInt(process.env.PREMIUM_MONTHLY_PRICE_MZN || "299", 10);
  res.json({
    appName: "Candidate-se",
    currency: "MZN",
    monthlyPriceMzn: monthlyPrice,
    netshop: {
      ...netshopStatus,
      webhookUrl: `${process.env.APP_URL || req.protocol + "://" + req.get("host")}/api/webhooks/netshop`
    },
    paymentMethods: [
      {
        id: "card",
        name: "Cart\xE3o Banc\xE1rio",
        operator: "Millennium BIM / BCI / Standard Bank / Visa / Mastercard",
        color: "#0284c7",
        phonePrefixes: [],
        description: "Cart\xE3o de D\xE9bito ou Cr\xE9dito internacional e nacional com aprova\xE7\xE3o instant\xE2nea 3D-Secure",
        badge: "100% Funcional"
      }
    ]
  });
});
apiRouter.post("/payments/initiate", async (req, res) => {
  try {
    const { paymentMethod = "card", customerPhone, customerEmail, customerName, amount, cardDetails } = req.body;
    const finalMethod = "card";
    const finalAmount = Number(amount) || parseInt(process.env.PREMIUM_MONTHLY_PRICE_MZN || "299", 10);
    const reference = `CV-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1e3)}`;
    const initiateReq = {
      reference,
      amount: finalAmount,
      currency: "MZN",
      paymentMethod: finalMethod,
      customerPhone,
      customerEmail: customerEmail || "cliente@cv.co.mz",
      customerName: customerName || "Cliente CV Pro",
      cardDetails,
      callbackUrl: `${process.env.APP_URL || req.protocol + "://" + req.get("host")}/api/webhooks/netshop`
    };
    const netshopRes = await netshop.initiatePayment(initiateReq);
    if (!netshopRes.success) {
      const failedTx = {
        id: netshopRes.transactionId || `tx_${Date.now()}`,
        reference,
        amount: finalAmount,
        currency: "MZN",
        method: finalMethod,
        phone: customerPhone,
        email: customerEmail,
        name: customerName,
        status: "failed",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        log: [{ timestamp: (/* @__PURE__ */ new Date()).toISOString(), message: netshopRes.message }]
      };
      transactions.set(reference, failedTx);
      return res.status(400).json({
        success: false,
        reference,
        message: netshopRes.message || "Falha ao iniciar pagamento"
      });
    }
    const tx = {
      id: netshopRes.transactionId || `tx_${Date.now()}`,
      reference,
      amount: finalAmount,
      currency: "MZN",
      method: finalMethod,
      phone: customerPhone,
      email: customerEmail,
      name: customerName,
      status: netshopRes.status,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      netshopId: netshopRes.transactionId,
      log: [{ timestamp: (/* @__PURE__ */ new Date()).toISOString(), message: netshopRes.message }]
    };
    transactions.set(reference, tx);
    res.json({
      success: true,
      reference,
      transactionId: netshopRes.transactionId,
      status: netshopRes.status,
      message: netshopRes.message,
      checkoutUrl: netshopRes.checkoutUrl
    });
  } catch (error) {
    console.error("Erro ao iniciar pagamento Netshop:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Erro ao comunicar com o gateway de pagamentos"
    });
  }
});
apiRouter.get("/payments/status/:reference", async (req, res) => {
  const { reference } = req.params;
  const tx = transactions.get(reference);
  if (!tx) {
    return res.status(404).json({ success: false, message: "Transa\xE7\xE3o n\xE3o encontrada" });
  }
  if (tx.status === "processing" || tx.status === "pending") {
    const statusCheck = await netshop.checkPaymentStatus(tx.netshopId || reference);
    if (statusCheck.status === "completed" || statusCheck.status === "success") {
      tx.status = "completed";
      tx.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      if (tx.phone) {
        const expires = /* @__PURE__ */ new Date();
        expires.setDate(expires.getDate() + 30);
        subscribers.set(tx.phone, { phone: tx.phone, expiresAt: expires.toISOString(), reference });
      }
    } else if (statusCheck.status === "failed") {
      tx.status = "failed";
      tx.log?.push({ timestamp: (/* @__PURE__ */ new Date()).toISOString(), message: statusCheck.message });
    }
  }
  res.json({
    success: true,
    status: tx.status,
    message: tx.status === "failed" ? tx.log?.[tx.log.length - 1]?.message : void 0,
    transaction: tx
  });
});
apiRouter.get("/admin/netshop-ping", async (req, res) => {
  try {
    const pingResult = await netshop.ping();
    res.json(pingResult);
  } catch (e) {
    res.status(500).json({ ok: false, message: e?.message });
  }
});
apiRouter.post("/payments/confirm", (req, res) => {
  const { reference } = req.body;
  const tx = transactions.get(reference);
  if (!tx) {
    return res.status(404).json({ success: false, message: "Transa\xE7\xE3o n\xE3o encontrada" });
  }
  tx.status = "completed";
  tx.completedAt = (/* @__PURE__ */ new Date()).toISOString();
  tx.log?.push({ timestamp: (/* @__PURE__ */ new Date()).toISOString(), message: "Pagamento confirmado e subscri\xE7\xE3o premium ativada." });
  const expires = /* @__PURE__ */ new Date();
  expires.setDate(expires.getDate() + 30);
  if (tx.phone) {
    subscribers.set(tx.phone, { phone: tx.phone, expiresAt: expires.toISOString(), reference });
  }
  res.json({
    success: true,
    status: "completed",
    transaction: tx,
    expiresAt: expires.toISOString()
  });
});
var handleWebhook = (req, res) => {
  const payload = req.body || {};
  const signature = req.headers["x-netshop-signature"] || req.headers["authorization"];
  console.log("[Netshop Webhook Received]:", JSON.stringify(payload, null, 2));
  webhookLogs.unshift({
    receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
    signature,
    payload,
    headers: req.headers
  });
  if (webhookLogs.length > 50) {
    webhookLogs.pop();
  }
  const ref = payload.reference || payload.ref || payload.transaction_reference;
  const status = payload.status || payload.event_type;
  if (ref && transactions.has(ref)) {
    const tx = transactions.get(ref);
    if (status === "completed" || status === "success" || status === "PAID" || status === "APPROVED") {
      tx.status = "completed";
      tx.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      tx.log?.push({ timestamp: (/* @__PURE__ */ new Date()).toISOString(), message: "Webhook Netshop: Pagamento conclu\xEDdo com sucesso" });
      if (tx.phone) {
        const expires = /* @__PURE__ */ new Date();
        expires.setDate(expires.getDate() + 30);
        subscribers.set(tx.phone, { phone: tx.phone, expiresAt: expires.toISOString(), reference: ref });
      }
    } else if (status === "failed" || status === "rejected") {
      tx.status = "failed";
      tx.log?.push({ timestamp: (/* @__PURE__ */ new Date()).toISOString(), message: "Webhook Netshop: Pagamento rejeitado ou falhado" });
    }
  }
  res.status(200).json({ received: true, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
};
apiRouter.post("/webhooks/netshop", handleWebhook);
apiRouter.post("/payments/webhook", handleWebhook);
apiRouter.get("/admin/webhooks", (req, res) => {
  res.json({
    total: webhookLogs.length,
    logs: webhookLogs
  });
});
apiRouter.post("/ai/enhance-summary", async (req, res) => {
  try {
    const { currentSummary, jobTitle, skills, tone } = req.body;
    const improved = await improveSummaryWithAI({
      currentSummary: currentSummary || "",
      jobTitle: jobTitle || "",
      skills: skills || [],
      tone
    });
    res.json({ success: true, summary: improved });
  } catch (error) {
    console.warn("AI fallback:", error?.message);
    res.json({ success: true, summary: req.body?.currentSummary || "Profissional dedicado com s\xF3lida trajet\xF3ria na execu\xE7\xE3o de projetos e foco em inova\xE7\xE3o e resultados." });
  }
});
apiRouter.post("/ai/suggest-skills", async (req, res) => {
  try {
    const { jobTitle } = req.body;
    const skills = await suggestSkillsWithAI(jobTitle || "Profissional");
    res.json({ success: true, skills });
  } catch (error) {
    console.warn("AI fallback skills:", error?.message);
    res.json({ success: true, skills: ["Gest\xE3o de Projetos", "Comunica\xE7\xE3o Estrat\xE9gica", "Resolu\xE7\xE3o de Problemas", "Trabalho em Equipa", "Orienta\xE7\xE3o para Resultados"] });
  }
});
apiRouter.post("/ai/generate-tailored-cv", async (req, res) => {
  try {
    const { fullName, careerField, experienceLevel, location, email, phone } = req.body;
    const cvData = await generateTailoredResumeWithAI({
      fullName: fullName || "Profissional",
      careerField: careerField || "Geral",
      experienceLevel: experienceLevel || "J\xFAnior (1-3 anos)",
      location: location || "Maputo, Mo\xE7ambique",
      email: email || "",
      phone: phone || ""
    });
    res.json({ success: true, cvData });
  } catch (error) {
    console.warn("AI fallback CV:", error?.message);
    const cvData = await generateTailoredResumeWithAI({
      fullName: req.body?.fullName || "Profissional",
      careerField: req.body?.careerField || "Geral",
      experienceLevel: req.body?.experienceLevel || "J\xFAnior",
      location: req.body?.location || "Maputo",
      email: req.body?.email || "",
      phone: req.body?.phone || ""
    });
    res.json({ success: true, cvData });
  }
});
apiRouter.post("/ai/generate-cover-letter", async (req, res) => {
  try {
    const { fullName, careerField, jobTitle, companyName, recipientName, experienceSummary } = req.body;
    const letterData = await generateCoverLetterWithAI({
      fullName: fullName || "Profissional",
      careerField: careerField || "Profissional",
      jobTitle: jobTitle || careerField || "Especialista",
      companyName: companyName || "Empresa em Mo\xE7ambique",
      recipientName: recipientName || "Diretor de Recursos Humanos",
      experienceSummary: experienceSummary || ""
    });
    res.json({ success: true, letterData });
  } catch (error) {
    console.warn("AI fallback letter:", error?.message);
    const letterData = await generateCoverLetterWithAI({
      fullName: req.body?.fullName || "Profissional",
      careerField: req.body?.careerField || "Profissional",
      jobTitle: req.body?.jobTitle || "Especialista",
      companyName: req.body?.companyName || "Empresa",
      recipientName: req.body?.recipientName || "Diretor",
      experienceSummary: ""
    });
    res.json({ success: true, letterData });
  }
});
apiRouter.get("/subscriptions/check", (req, res) => {
  const phone = req.query.phone;
  if (!phone) {
    return res.json({ isActive: false });
  }
  const normalized = netshop.normalizePhone(phone);
  const sub = subscribers.get(normalized) || subscribers.get(phone);
  if (sub && new Date(sub.expiresAt) > /* @__PURE__ */ new Date()) {
    return res.json({
      isActive: true,
      expiresAt: sub.expiresAt,
      reference: sub.reference,
      phone: sub.phone
    });
  }
  res.json({ isActive: false });
});
app.use("/api", apiRouter);
app.use("/", apiRouter);
var app_default = app;
export {
  app,
  app_default as default,
  subscribers,
  transactions,
  webhookLogs
};
