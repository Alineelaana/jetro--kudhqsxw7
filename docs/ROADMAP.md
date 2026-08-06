# ROADMAP.md — Roadmap Técnico e Estratégico

> **Documento vivo — Referência oficial da plataforma**
> Última atualização: 2026-08-06
> Status: Oficial
> Responsável: Product Owner & Architecture Council

---

## 1. Princípio Orientador

Este roadmap segue o princípio **Produto antes de Tecnologia**. Cada marco define primeiro o valor entregue ao cliente e depois as entregas técnicas necessárias. As priorizações são baseadas em:

1. Valor para o cliente (quanto resolve uma dor real)
2. Diferenciação competitiva (quanto nos diferencia)
3. Viabilidade técnica (esforço vs. impacto)
4. Dependências (o que precisa existir antes)

---

## 2. Roadmap Técnico (MVP → V1 → V2 → V3)

### MVP — Fundação e Operação Core

**Objetivo:** Entregar uma plataforma funcional que resolva as dores mais críticas do cliente: gestão operacional integrada com IA básica.

**Valor entregue:** O cliente gerencia sua empresa inteira em um único sistema, com dados conectados e dashboards de decisão.

| Entrega                      | Descrição                                            | Dependências         | PRD Ref      |
| ---------------------------- | ---------------------------------------------------- | -------------------- | ------------ |
| Gestão Empresarial Core      | Comercial, Financeiro, Estoque, Compras, Logística   | —                    | PRD §3.1–3.5 |
| Multi-empresa e Multi-filial | Estrutura organizacional completa                    | Gestão Core          | PRD §3.8     |
| Configuration Center Básico  | Parâmetros, permissões, numerações                   | Gestão Core          | PRD §7       |
| Auditoria e Logs             | Registro completo de ações                           | Plataforma           | PRD §3.8     |
| CMS do Site                  | Gestão de conteúdo, vitrine, formulário de orçamento | Plataforma           | PRD §3.6     |
| Chat de Atendimento          | Chat com clientes via site                           | Plataforma           | PRD §3.9     |
| Assistente de IA (Consultar) | Chat com IA que responde sobre dados                 | Gestão Core          | PRD §4, §8   |
| Portal do Cliente            | Self-service básico                                  | Comercial, Logística | PRD §10.6    |
| App do Motorista             | Entregas e comprovantes                              | Logística            | PRD §3.5     |
| Fiscal Básico                | NF-e, NFC-e, NFS-e                                   | Comercial            | PRD §3.1     |
| RH Básico                    | Colaboradores, ponto, folha                          | Plataforma           | PRD §3.7     |
| Backups e Restore            | Proteção de dados                                    | Plataforma           | PRD §3.8     |

**Critério de aceitação MVP:** Um cliente consegue operar toda sua empresa (vender, comprar, estocar, entregar, pagar, receber) na plataforma, com dashboards e assistente de IA.

---

### V1 — IA Operacional e Analytics

**Objetivo:** Tornar a plataforma inteligente — IA que não apenas responde, mas sugere e prepara ações.

**Valor entregue:** A plataforma começa a trabalhar pelo cliente, sugerindo ações e automatizando tarefas repetitivas.

| Entrega                         | Descrição                                               | Dependências  | PRD Ref        |
| ------------------------------- | ------------------------------------------------------- | ------------- | -------------- |
| Agentes Especializados          | Agentes por domínio (Vendas, Estoque, Financeiro, etc.) | MVP           | PRD §4         |
| Automações Inteligentes         | Gatilho → condição → ação com IA                        | MVP           | PRD §3.9, §7   |
| Smart Flows                     | Fluxos visuais com estágios de IA                       | MVP           | PRD §3.9       |
| Base de Conhecimento            | RAG com documentos do cliente                           | MVP           | PRD §3.9       |
| Dashboards Executivos           | Diretoria e Presidência                                 | MVP           | PRD §6.2       |
| Inteligência Preditiva Básica   | Previsão de vendas, estoque, caixa                      | V1 Agentes    | PRD §9.1       |
| Inteligência Prescritiva Básica | Sugestões de ação com confiança                         | V1 Preditiva  | PRD §9.2       |
| Aprovações de IA                | Fluxo de aprovação para ações de IA                     | V1 Agentes    | PRD §3.9       |
| WMS Avançado                    | Ondas, reposição automática, mapa                       | MVP Estoque   | PRD §3.4       |
| Gestão de Frota Completa        | Telemetria, custos, indicadores                         | MVP Logística | PRD §3.5       |
| Fiscal Avançado                 | Apuração, SPED, reforma tributária                      | MVP Fiscal    | PRD §3.1       |
| Contábil                        | Plano de contas, DRE, fechamento                        | V1 Financeiro | PRD §3.3       |
| CRM Completo                    | Funil, propostas, atividades                            | MVP Comercial | PRD §3.1       |
| Centro de Atendimento           | SAC com SLA, classificação IA                           | MVP Chat      | PRD §3.9       |
| Conformidade                    | LGPD, trabalhista, SST                                  | MVP RH        | PRD §3.7, §3.8 |

**Critério de aceitação V1:** A IA sugere ações que o usuário aprova, e 30%+ das tarefas repetitivas são automatizadas.

---

### V2 — Plataforma como Ecossistema

**Objetivo:** Abrir a plataforma para parceiros e clientes construírem sobre ela.

**Valor entregue:** A plataforma deixa de ser apenas um produto e torna-se um ecossistema onde terceiros criam valor.

| Entrega                      | Descrição                                 | Dependências   | PRD Ref               |
| ---------------------------- | ----------------------------------------- | -------------- | --------------------- |
| APIs Públicas                | OpenAPI, SDKs, webhooks, sandbox          | V1             | PRD §10.5             |
| Marketplace                  | Plugins, integrações, modelos de IA       | V1 APIs        | PRD §10.4             |
| Mobile App                   | App nativo para gestão móvel              | V1             | PRD §3.8              |
| White Label Completo         | Branding, domínio, templates por parceiro | V1             | PRD §11               |
| Master Portal Completo       | Gestão total da plataforma                | V1             | PRD §12               |
| Inteligência Auto-Analítica  | Plataforma analisa próprio uso            | V1             | PRD §8, PLATFORM §8.3 |
| Feature Flags Avançadas      | Canary, A/B testing, rollback             | V1             | ARCH §5               |
| Multi-moeda                  | Operações em diferentes moedas            | V1 Financeiro  | PRD §3.3              |
| Multi-idioma                 | Interface em múltiplos idiomas            | V1             | PRD §3.8              |
| IA com Execução Autorizada   | Nível 5 de autonomia                      | V1             | PRD §4.3              |
| Marketplace de Modelos de IA | Modelos especializados por setor          | V2 Marketplace | PRD §10.4             |
| Plugin SDK                   | Kit de desenvolvimento para plugins       | V2 Marketplace | ARCH §11              |
| App do Motorista Avançado    | Offline, navegação, coleta de prova       | V1 App         | PRD §3.5              |

**Critério de aceitação V2:** Existem plugins de terceiros no marketplace e clientes integram sistemas via APIs públicas.

---

### V3 — Escala Enterprise e IA Avançada

**Objetivo:** Atender grandes empresas com exigências de escala, segurança e customização.

**Valor entregue:** Enterprise clientes operam com instância dedicada, IA preditiva avançada e SLA garantido.

| Entrega                        | Descrição                              | Dependências | PRD Ref         |
| ------------------------------ | -------------------------------------- | ------------ | --------------- |
| Instância Dedicada             | Migração transparente para Enterprise  | V2           | ARCH §3         |
| IA Multimodal                  | Texto, imagem, voz, vídeo              | V2           | PRD §4, ARCH §8 |
| Modelos Locais                 | IA on-premise para Enterprise          | V2           | ARCH §8.3       |
| Colaboração entre Agentes      | Agentes conversam entre si             | V2           | PRD §4          |
| IA com Aprendizado Contínuo    | Aprende com feedback e resultados      | V2           | PRD §3.9        |
| Analytics Avançado             | BI completo, ML customizado            | V2           | PRD §6          |
| Integrações Governamentais     | E-social, SPED avançado, DCTF          | V2 Fiscal    | PRD §3.1        |
| SLA e Monitoramento Enterprise | 99.99% uptime, suporte dedicado        | V2           | PRD §10.1       |
| Auditoria com IA Avançada      | Detecção de fraude em tempo real       | V1           | ARCH §7.6       |
| Plataforma de Desenvolvedores  | SDK completo, documentação, comunidade | V2 APIs      | PRD §10.5       |

**Critério de aceitação V3:** Enterprise clientes operam em instância dedicada com IA que aprende continuamente.

---

## 3. Roadmap Estratégico de 5 Anos

### Ano 1 (2026–2027): MVP, Primeiros Clientes, IA Operacional

**Meta:** Lançar a plataforma, conquistar os primeiros 50 clientes pagantes, estabelecer IA como diferencial.

| Foco               | Entregas                                                         |
| ------------------ | ---------------------------------------------------------------- |
| **Produto**        | MVP completo (gestão integrada + IA consultiva)                  |
| **Comercial**      | Trial, planos (Free/Starter/Professional), onboarding automático |
| **IA**             | Assistente que responde perguntas e sugere ações                 |
| **Clientes**       | 50 clientes pagantes (foco em PME capixaba)                      |
| **Infraestrutura** | Banco compartilhado, observabilidade básica                      |
| **Equipe**         | Produto, dev, suporte, customer success                          |
| **Métricas**       | MRR R$ 25k, churn < 5%, NPS > 40                                 |

**Marco crítico:** Validar product-market fit — clientes pagando e usando ativamente.

---

### Ano 2 (2027–2028): Marketplace, APIs Públicas, Mobile

**Meta:** Abrir a plataforma, lançar mobile, iniciar ecossistema.

| Foco            | Entregas                                            |
| --------------- | --------------------------------------------------- |
| **Produto**     | V1 completo (IA operacional, analytics, automações) |
| **Plataforma**  | APIs públicas, SDKs, webhooks                       |
| **Marketplace** | Lançamento com primeiros plugins                    |
| **Mobile**      | App nativo iOS/Android                              |
| **White Label** | Primeiros parceiros revendendo                      |
| **IA**          | Agentes especializados, preditiva básica            |
| **Clientes**    | 200 clientes pagantes                               |
| **Receita**     | MRR R$ 100k, marketplace começa a gerar receita     |
| **Expansão**    | Sair do ES — atender todo o Sudeste                 |

**Marco crítico:** Marketplace com plugins de terceiros e APIs públicas em uso.

---

### Ano 3 (2028–2029): Ecossistema de Parceiros, IA Colaborativa, Marketplace de Módulos

**Meta:** Estabelecer a plataforma como ecossistema; parceiros criando valor.

| Foco                  | Entregas                                             |
| --------------------- | ---------------------------------------------------- |
| **Ecossistema**       | 100+ plugins no marketplace                          |
| **IA**                | Agentes colaborativos, aprendizado contínuo          |
| **Parceiros**         | Programa de parceiros implementadores                |
| **Marketplace de IA** | Modelos especializados por setor                     |
| **Internacional**     | Preparação para expansão (multi-idioma, multi-moeda) |
| **Clientes**          | 500 clientes pagantes                                |
| **Receita**           | MRR R$ 300k, marketplace 15% da receita              |
| **Expansão**          | Atender todo o Brasil                                |

**Marco crítico:** Ecossistema auto-sustentável com parceiros criando plugins e implementações.

---

### Ano 4 (2029–2030): Expansão Internacional, Multi-idioma, Multi-moeda

**Meta:** Levar a plataforma para fora do Brasil.

| Foco              | Entregas                                                  |
| ----------------- | --------------------------------------------------------- |
| **Internacional** | Operação em LATAM (Portugal, México, Colômbia, Argentina) |
| **Multi-idioma**  | Português, Espanhol, Inglês                               |
| **Multi-moeda**   | Operações em BRL, USD, EUR, MXN                           |
| **Compliance**    | LGPD (BR), GDPR (EU), data residency                      |
| **Enterprise**    | Instâncias dedicadas, SLA 99.99%                          |
| **IA**            | Multilíngue, multimodal, modelos locais                   |
| **Clientes**      | 1.000 clientes pagantes                                   |
| **Receita**       | MRR R$ 800k, 20% internacional                            |

**Marco crítico:** Clientes internacionais pagantes e operação multi-país.

---

### Ano 5 (2030–2031): Plataforma Aberta, IA Preditiva, Developer Platform

**Meta:** Estabelecer a plataforma como referência em gestão inteligente.

| Foco                   | Entregas                                          |
| ---------------------- | ------------------------------------------------- |
| **Plataforma Aberta**  | Developer platform completa, comunidade ativa     |
| **IA Preditiva**       | Previsões com >90% de acerto, prescrição autônoma |
| **Developer Platform** | SDK, documentação, certificações, comunidade      |
| **Ecossistema**        | 500+ plugins, 50+ parceiros, 10+ modelos de IA    |
| **Internacional**      | Operação em 5+ países                             |
| **Enterprise**         | 50+ clientes Enterprise em instância dedicada     |
| **Clientes**           | 2.000+ clientes pagantes                          |
| **Receita**            | MRR R$ 2M+, marketplace 25% da receita            |

**Marco crítico:** Plataforma reconhecida como referência em gestão inteligente na LATAM.

---

## 4. Matriz de Priorização

| Prioridade       | Critério                            | Exemplos atuais                       |
| ---------------- | ----------------------------------- | ------------------------------------- |
| **P0 — Crítica** | Sem ela o produto não funciona      | Gestão core, multi-tenancy, auditoria |
| **P1 — Alta**    | Diferencial competitivo imediato    | IA consultiva, dashboards, WMS        |
| **P2 — Média**   | Valor importante mas não bloqueante | Marketplace, mobile, white label      |
| **P3 — Baixa**   | Nice-to-have, futuro                | IA multimodal, modelos locais         |

---

## 5. Dependências Críticas

```
Multi-tenancy (P0)
    └── Gestão Core (P0)
         ├── IA Consultiva (P1)
         │    └── Agentes Especializados (P1)
         │         └── IA Preditiva (P1)
         │              └── IA Prescritiva (P1)
         │                   └── IA com Execução (V2)
         ├── Configuration Center (P0)
         │    └── Automações (P1)
         ├── APIs Públicas (V2)
         │    └── Marketplace (V2)
         │         └── Plugin SDK (V2)
         └── White Label (V2)
              └── Master Portal Completo (V2)
```

---

## 6. Gestão deste Documento

- **Tipo:** Documento vivo
- **Frequência de revisão:** Trimestral ou a cada release
- **Responsável:** Product Owner
- **Aprovação:** Architecture Council
- **Rastreabilidade:** Cada item do roadmap referencia o PRD e o BACKLOG

---

_O roadmap é ambicioso mas realista. Cada marco é validado pelo mercado antes de avançar. A qualidade prevalece sobre a velocidade._
