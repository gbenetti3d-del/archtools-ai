import { CompanyConfig } from './types';

export const DEFAULT_CONFIG: CompanyConfig = {
  companyName: "ArchTools",
  tone: "innovative",
  websiteUrl: "https://www.behance.net/gabrielcostabenetti",
  context: `
SOBRE A ARCHTOOLS:
A ArchTools é um ecossistema completo de soluções visuais e tecnológicas para o mercado imobiliário e de construção civil. 
Não vendemos apenas "imagens 3D"; entregamos ferramentas estratégicas que aceleram vendas, reduzem custos de marketing e fortalecem a marca das construtoras.

NOSSAS SOLUÇÕES (O QUE FAZEMOS):
1. Renders Ultra-Realistas & Concept Art: Imagens de alto impacto para pré-lançamentos e concursos.
2. Plantas Humanizadas: Diferenciação didática e estética para o cliente final entender o layout.
3. Vídeos Cinematográficos: Storytelling visual que emociona e gera desejo antes da obra começar.
4. Tour Virtual 360º & VR: Imersão total que substitui ou complementa o apartamento decorado físico.
5. Projetos Interativos (Apps de Venda): Aplicativos gamificados onde o cliente troca acabamentos, vê a vista do drone e explora o empreendimento.

BENEFÍCIOS COMPROVADOS (DADOS DE MERCADO & KPIS):
Baseado em estudos de impacto de soluções 3D de alto padrão no mercado imobiliário, nossos produtos geram:
- Aumento de Conversão: Ferramentas visuais elevam a taxa de conversão de leads em vendas entre 15% e 25% (Fonte: Análise interna baseada em PropertyRender 2025).
- Aceleração de Vendas: Redução média de 20% no tempo de ciclo de venda.
- Economia de Marketing: Redução de até 30% em custos promocionais, substituindo maquetes físicas e estandes caros por ativos digitais (Kaushik et al., 2023).

DIRETRIZES TÉCNICAS E PADRÃO DE QUALIDADE (KNOWLEDGE BASE TÉCNICO):
A ArchTools se diferencia pela excelência técnica. Dominamos as ferramentas para garantir fotorrealismo e performance:

1. FLUXO DE PRODUÇÃO NO 3DS MAX & CORONA RENDERER:
   - Iluminação (Lighting): Utilizamos HDRI de alto alcance dinâmico para iluminação global natural, complementada por Corona Lights para destaques artificiais. Dominamos o "LightMix" para ajustes finos de intensidade e temperatura de cor em pós-produção sem re-render.
   - Modelagem: Poligonal limpa (Quad-based topology) para evitar artefatos. Uso de "Corona Scatter" para vegetação complexa e grama realista sem pesar a memória.
   - Texturização & Materiais (Shading): Workflow 100% PBR (Physically Based Rendering). Mapas de Albedo, Glossiness, Reflection, IOR correto (ex: Vidro 1.52, Água 1.33) e Displacement/Normal Maps para relevos detalhados. Nossos materiais reagem à luz exatamente como no mundo real.
   - Composição no Render: Uso de LUTs fotográficos para color grading e Corona Image Editor para controle de Bloom & Glare (efeitos de lente).

2. UNREAL ENGINE 5 PARA ARCHVIZ (TEMPO REAL & INTERATIVIDADE):
   - Iluminação Dinâmica (Lumen): Utilizamos o sistema Lumen para Global Illumination (GI) e reflexos em tempo real, eliminando a necessidade de "baking" demorado de luzes e permitindo mudanças de horário instantâneas.
   - Geometria Infinita (Nanite): Importação de modelos de altíssima poligonagem (fotogrametria, scans) sem perda de performance, garantindo detalhes microscópicos nas texturas.
   - Datasmith: Fluxo de trabalho direto do Revit/Sketchup para Unreal, mantendo a fidelidade das medidas do projeto.
   - Blueprints: Programação visual para criar interações (abrir portas, acender luzes, trocar pisos) nos nossos aplicativos de venda.

3. FOTOGRAFIA & COMPOSIÇÃO PARA ARCHVIZ:
   - Enquadramento: Seguimos regras áureas da fotografia arquitetônica. Regra dos Terços para equilíbrio, Linhas Guia (Leading Lines) para direcionar o olhar ao ponto focal do projeto, e Simetria para ambientes clássicos.
   - Câmeras Físicas: Simulamos câmeras reais (ISO, Shutter Speed, f-stop).
     * Lentes Wide (16mm-24mm): Para valorizar a amplitude de interiores pequenos e fachadas imponentes.
     * Lentes Tele (50mm-85mm): Para detalhes, "close-ups" de decoração e compor imagens com menos distorção de perspectiva (efeito ortogonal).
   - Correção de Perspectiva: Uso obrigatório de "Automatic Vertical Tilt" para manter as linhas verticais das paredes perfeitamente retas (2-point perspective), padrão ouro na fotografia de arquitetura.

4. ANIMAÇÃO & CINEMATOGRAFIA:
   - Movimento de Câmera: Movimentos suaves e intencionais (Dolly, Pan, Tilt). Evitamos movimentos bruscos que causam enjoo em VR.
   - FPS (Quadros por segundo): Renderizamos em 30fps para vídeos padrão e 60fps para fluidez máxima em experiências interativas.
   - Storytelling Visual: Nossos vídeos não são apenas "passeios"; eles têm roteiro. Começamos estabelecendo o contexto (drone), entramos no imóvel (experiência humana) e focamos nos detalhes de acabamento (valor agregado).

FUNDAMENTAÇÃO CIENTÍFICA E AUTORIDADE (POR QUE INVESTIR?):
A ArchTools baseia suas soluções em pesquisas globais que validam a tecnologia como motor de vendas:

1. SUBSTITUIÇÃO DE VISITAS FÍSICAS (EFICIÊNCIA):
   - Estudos de Ozacar et al. (2017) e Kaushik et al. (2023) comprovam que a Realidade Virtual e Tours 360º podem substituir com eficácia as visitas físicas em imóveis na planta ("off-plan"), permitindo vendas remotas e economizando tempo da equipe comercial.

2. INOVAÇÃO COMO REQUISITO, NÃO LUXO:
   - Relatório da ULI & Ernst & Young (2022) sobre a "Era do Inventário" destaca que em mercados desenvolvidos, a tecnologia (IA, Visualização) é a única resposta viável para os desafios de estoque e gestão.
   - O "PropTech Global Trends 2023" (ESCP Business School) reforça que o mercado exige inovação; empresas analógicas perdem valor de marca e competitividade.

3. MIT CENTER FOR REAL ESTATE (2016):
   - Tecnologias emergentes estão redesenhando o ambiente construído. A ArchTools aplica esses conceitos para garantir que seus clientes estejam à frente da curva de inovação ("Real Estate Innovation by the Numbers").

4. COMPREENSÃO DO PRODUTO E NEUROCIÊNCIA:
   - Pesquisa de 2020 ("Visualization of 3D Property Data") indica que a qualidade da renderização afeta diretamente a compreensão cognitiva do imóvel. Nossos renders de alta fidelidade eliminam a ambiguidade e a insegurança do comprador.

CAPACIDADE DE ATENDIMENTO (DIAGNÓSTICO):
Atuamos como parceiros estratégicos. Antes de orçar, investigamos:
- O estágio do projeto.
- O perfil do comprador (Investidor ou Morador?).
- A "alma" do projeto (Sofisticado, Familiar, Minimalista?).

PÚBLICO-ALVO PRIORITÁRIO:
- Construtoras e Incorporadoras (Foco Principal).
- Arquitetos de Projetos de Alto Padrão.
- Leads qualificados do setor imobiliário.
  `.trim()
};