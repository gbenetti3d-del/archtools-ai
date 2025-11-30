import { GoogleGenAI, Chat, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";
import { CompanyConfig, UserProfile, EmailLog } from "../types";

// Safe access to API Key to avoid "process is not defined" crashes in browser environments
const getApiKey = () => {
  try {
    if (typeof process !== "undefined" && process.env) {
      return process.env.API_KEY || "";
    }
  } catch (e) {
    console.warn("Ambiente sem acesso a process.env");
  }
  return "";
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

let chatSession: Chat | null = null;

// Armazenamento em memória para simulação de servidor de e-mail
export const emailLogs: EmailLog[] = [];

const emailTool: FunctionDeclaration = {
  name: 'send_analysis_email',
  description: 'Envia um relatório técnico e comercial detalhado para o email gbenetti3d@gmail.com. Use esta função SEMPRE que chegar a uma conclusão ou solução final para o cliente.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      clientName: {
        type: Type.STRING,
        description: 'Nome do cliente'
      },
      clientStatus: {
        type: Type.STRING,
        description: 'Indica se é "NOVO CLIENTE" ou "CLIENTE RECORRENTE"'
      },
      registrationData: {
        type: Type.STRING,
        description: 'Dados completos do cadastro: Empresa, Tipo de Projeto, Estágio da Obra e Informações Adicionais.'
      },
      projectName: {
        type: Type.STRING,
        description: 'Nome do projeto'
      },
      summary: {
        type: Type.STRING,
        description: 'Resumo do diagnóstico e necessidade'
      },
      solution: {
        type: Type.STRING,
        description: 'Solução técnica e comercial proposta'
      }
    },
    required: ['clientName', 'clientStatus', 'registrationData', 'projectName', 'summary', 'solution']
  }
};

// Nova função para gerar relatório analítico via chat
export const generateSessionReport = async (history: string): Promise<string> => {
    if (!apiKey) return "Não foi possível gerar o relatório: API Key não configurada.";
    
    try {
        const reportAI = new GoogleGenAI({ apiKey });
        const model = reportAI.models.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            config: {
                temperature: 0.2, // Baixa temperatura para precisão
            }
        });

        const prompt = `
        ATUE COMO UM ANALISTA SÊNIOR DE PROJETOS.
        Analise o seguinte histórico de conversa entre a I.A. da ArchTools e um cliente.
        Gere um SUMÁRIO EXECUTIVO ESTRUTURADO (em Markdown) contendo:
        1. DIAGNÓSTICO: Qual era o problema ou dúvida exata do cliente?
        2. SOLUÇÃO TÉCNICA: O que foi proposto ou resolvido?
        3. PRÓXIMOS PASSOS: Ações recomendadas.

        Histórico da conversa:
        ${history}
        `;

        const result = await model.generateContent({ contents: prompt });
        return result.response.text();
    } catch (e) {
        console.error("Erro ao gerar relatório", e);
        return "Erro ao gerar o relatório automático. Verifique a configuração da API Key.";
    }
};

// Função para notificação silenciosa de registro (Email de Entrada)
export const sendRegistrationNotification = (user: UserProfile) => {
    const recipient = "gbenetti3d@gmail.com";
    const timestamp = new Date().toLocaleString('pt-BR');
    let subject = "";
    let body = "";

    if (user.clientType === 'new') {
        subject = `🚀 NOVO LEAD (SITE): ${user.name} - ${user.project}`;
        body = `ALERTA DE NOVO CLIENTE - ARCHTOOLS
DATA: ${timestamp}

PERFIL DO LEAD:
Nome: ${user.name}
Empresa: ${user.company}
Nome do Projeto: ${user.project}

DETALHES TÉCNICOS DA OPORTUNIDADE:
Tipo de Projeto: ${user.projectType}
Estágio da Obra: ${user.projectStage}

EXPECTATIVAS / DEMANDA INICIAL:
"${user.additionalInfo}"

Ação Recomendada: Acompanhar interação da I.A. em tempo real.`;
    } else {
        subject = `👤 ACESSO DE CLIENTE RECORRENTE: ${user.company}`;
        body = `ALERTA DE ACESSO - SISTEMA
DATA: ${timestamp}

IDENTIFICAÇÃO:
Nome: ${user.name}
Empresa: ${user.company}
Projeto Foco Atual: ${user.project}

Status: Cliente da base acessando para suporte ou novas demandas.`;
    }

    // Registrar no Log do Sistema (Simulação)
    emailLogs.unshift({
        id: Date.now().toString(),
        timestamp,
        to: recipient,
        subject,
        body,
        type: 'lead'
    });

    // Simulação do envio (Log no console visível apenas para desenvolvedores/admin)
    console.group(`%c📧 EMAIL AUTOMÁTICO ENVIADO PARA: ${recipient}`, "color: #0ea5e9; font-weight: bold; font-size: 12px;");
    console.log(`%cASSUNTO: ${subject}`, "font-weight: bold;");
    console.log(body);
    console.groupEnd();
};

export const initializeChat = (config: CompanyConfig, user: UserProfile) => {
  let toneInstruction = "";

  switch (config.tone) {
    case 'formal':
      toneInstruction = "Seja objetivo, técnico e direto ao ponto.";
      break;
    case 'welcoming':
      toneInstruction = "Seja prestativo e educado, mas mantenha o foco na solução técnica.";
      break;
    case 'minimalist':
      toneInstruction = "Use respostas curtas e precisas.";
      break;
    case 'innovative':
      toneInstruction = "Use terminologia técnica correta e atualizada.";
      break;
    default:
      toneInstruction = "Seja profissional e resolutivo.";
  }

  const isNewClient = user.clientType === 'new';
  
  // Prepare formatted registration data strings for the prompt
  const clientStatusString = isNewClient ? 'NOVO CLIENTE' : 'CLIENTE RECORRENTE';
  
  const systemInstruction = `
    Você é a I.A. técnica da empresa ${config.companyName}.
    
    PERFIL DO CLIENTE (INTERLOCUTOR):
    Nome: ${user.name}
    Empresa: ${user.company}
    Projeto Foco: ${user.project}
    Status: ${clientStatusString}
    ${isNewClient ? `
    DADOS TÉCNICOS INICIAIS:
    - Tipologia: ${user.projectType || 'N/A'}
    - Estágio: ${user.projectStage || 'N/A'}
    - Demanda/Problema Relatado: "${user.additionalInfo || 'N/A'}"
    ` : ''}
    
    SUA MISSÃO (PRIORIDADE MÁXIMA):
    Resolver a dúvida ou problema apresentado pelo cliente de forma objetiva e técnica.
    
    DIRETRIZES DE COMPORTAMENTO (IMPORTANTE):
    1. **NÃO SEJA VENDEDOR**: Não tente vender produtos, não faça "upsell", não use frases de efeito de marketing ("vamos alavancar suas vendas") a menos que o cliente explicitamente pergunte sobre isso.
    2. **FOCO NO PROBLEMA**: Se o cliente perguntar sobre uma textura, responda sobre a textura. Se perguntar sobre prazo, responda sobre prazo. Não desvie o assunto.
    3. **SEM DESCULPAS**: Nunca inicie frases com "Desculpe", "Sinto muito" ou "Peço perdão". Se houver um erro, corrija-o imediatamente e prossiga.
    4. **CONSULTORIA TÉCNICA**: Use a base de conhecimento (Knowledge Base) para fornecer respostas embasadas tecnicamente (ex: explicar configurações de Corona Render, Unreal Engine, processos de arquivo).
    
    PROTOCOLO DE ATENDIMENTO:
    1. Analise a entrada do usuário.
    2. Se for uma dúvida técnica, explique a solução usando os conhecimentos de 3ds Max/Corona/Unreal descritos no contexto.
    3. Se for uma solicitação de serviço, colete apenas os dados estritamente necessários para orçar ou executar.
    4. Se a solução estiver clara e definida, CHAME A FUNÇÃO 'send_analysis_email' para registrar a conclusão do atendimento.

    BASE DE CONHECIMENTO TÉCNICO (Use apenas para resolver problemas, não para propaganda):
    ${config.context}

    TOM DE VOZ: ${toneInstruction}
  `;

  // Safely attempt to create chat. If apiKey is missing, it will fail later or log warning.
  if (!apiKey) {
      console.error("CRITICAL: API Key missing. Chat initialization will fail.");
  }

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.2, // Temperatura mais baixa para ser mais determinístico e menos "criativo/vendedor"
      tools: [{ functionDeclarations: [emailTool] }],
    },
  });
};

export const sendMessageToGemini = async function* (message: string, imageBase64?: string): AsyncGenerator<string, void, unknown> {
  if (!chatSession) {
    yield "⚠️ Erro de Inicialização: Sessão de chat não encontrada. Tente recarregar a página.";
    return;
  }

  if (!apiKey) {
      yield "⚠️ **Erro de Configuração**: A chave de API (API Key) não foi detectada.\n\nSe você está rodando no Vercel:\n1. Vá em **Settings > Environment Variables**.\n2. Adicione uma chave chamada `API_KEY` com sua chave do Google Gemini.\n3. Faça o Redeploy do projeto.";
      return;
  }

  try {
    let resultStream;

    if (imageBase64) {
      // Extract pure base64 and mimeType from data URL
      const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const data = matches[2];

        // Send multimodal message (Text + Image)
        resultStream = await chatSession.sendMessageStream({
          message: [
            { text: message || "Analise esta imagem tecnicamente (iluminação, composição, materiais) e identifique possíveis problemas ou soluções." },
            { inlineData: { mimeType, data } }
          ]
        });
      } else {
        resultStream = await chatSession.sendMessageStream({ message });
      }
    } else {
      // Text only message
      resultStream = await chatSession.sendMessageStream({ message });
    }
    
    // Process stream handling function calls
    for await (const chunk of resultStream) {
       const c = chunk as GenerateContentResponse;
       
       // Handle text chunks
       if (c.text) {
         yield c.text;
       }

       // Handle Function Calls silently
       const functionCalls = c.candidates?.[0]?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall);
       
       if (functionCalls && functionCalls.length > 0) {
         for (const fc of functionCalls) {
           if (fc.name === 'send_analysis_email') {
             
             const subject = "Relatório Técnico Final - " + fc.args['clientName'];
             const body = `Cliente: ${fc.args['clientName']}
Status: ${fc.args['clientStatus']}
Dados de Cadastro:
${fc.args['registrationData']}

Projeto: ${fc.args['projectName']}

Diagnóstico:
${fc.args['summary']}

Solução Técnica:
${fc.args['solution']}`;
             
             // Registrar no Log do Sistema (Simulação)
             emailLogs.unshift({
                id: Date.now().toString(),
                timestamp: new Date().toLocaleString('pt-BR'),
                to: "gbenetti3d@gmail.com",
                subject: subject,
                body: body,
                type: 'report'
             });

             // Simulate sending email silently without UI callback
             console.log("--------------- EMAIL SIMULATION START ---------------");
             console.log("TO: gbenetti3d@gmail.com");
             console.log("SUBJECT: " + subject);
             console.log("BODY:");
             console.log(body);
             console.log("--------------- EMAIL SIMULATION END ---------------");
             
             // Send response back to model so it knows it succeeded
             const toolResponse = await chatSession.sendMessageStream({
               content: {
                 parts: [
                   {
                     functionResponse: {
                       name: 'send_analysis_email',
                       response: { result: 'success', message: 'Relatório técnico registrado internamente.' }
                     }
                   }
                 ]
               }
             });

             for await (const toolChunk of toolResponse) {
                const tc = toolChunk as GenerateContentResponse;
                if (tc.text) {
                  yield tc.text;
                }
             }
           }
         }
       }
    }

  } catch (error: any) {
    console.error("Error communicating with Gemini:", error);
    
    // Tratamento de erros específicos para ajudar o usuário
    if (error.toString().includes('403') || error.toString().includes('API key')) {
        yield "⚠️ **Acesso Negado (Erro 403)**: A API Key configurada é inválida ou não tem permissão. Verifique suas configurações no Vercel.";
        return;
    }

    yield "Ocorreu uma instabilidade momentânea na comunicação com a I.A. Por favor, verifique se sua API Key está configurada corretamente nas variáveis de ambiente e tente novamente.";
  }
};