import type { ScreenDocEntry } from './types'

/**
 * DOCUMENTAÇÃO TÉCNICA E FUNCIONAL DAS 6 TELAS UNIFICADAS DE DEPARTAMENTO PESSOAL (DP)
 * Versão pós-reestruturação: arquitetura com abas internas, anexos genéricos,
 * exportação analítica e links rápidos entre entidades.
 */
export const DP_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  // -------------------------------------------------------------
  // DP 1. PAINEL DP (DASHBOARD EXECUTIVO)
  // -------------------------------------------------------------
  '/admin/dp': {
    route: '/admin/dp',
    title: 'Painel Geral do Departamento Pessoal',
    moduleGroup: 'Departamento Pessoal (DP)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Atuar como central de comando e cockpit executivo das rotinas de Departamento Pessoal, reunindo em painel único métricas em tempo real de colaboradores, folha de pagamento estimada, controle de férias, alertas do eSocial e atalhos rápidos para as telas operacionais.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cards de indicadores em tempo real: Total de Colaboradores Ativos, Total de Afastados, Férias a Vencer no mês, Ocorrências Pendentes de Ponto e Folha Estimada.\n- Monitor visual de status das transmissões ao eSocial (eventos pendentes, transmitidos e inconsistentes).\n- Gráficos sintéticos de distribuição de colaboradores por setor/departamento e tipo de contrato.\n- Barra de atalhos rápidos direcionando diretamente para: Colaboradores e Contratos, Jornada e Ponto, Férias e Afastamentos, Folha e Benefícios e Obrigações eSocial.\n- Feed de notificações e lembretes críticos de vencimentos de contrato de experiência (30/90 dias) e prazos de período concessivo de férias.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Os números refletem exclusivamente registros com status ativo da empresa/filial do usuário logado (multitenancy).\n- Férias com período concessivo a menos de 60 dias do vencimento geram alerta de prioridade alta para prevenir pagamento em dobro (Art. 137 da CLT).\n- Indicadores de folha utilizam projeções consolidadas a partir do salário-base e eventos pré-calculados do mês corrente.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor ou analista de DP acessa `/admin/dp`.\n2. O dashboard consulta em paralelo os registros ativos nas coleções `dp_collaborators`, `dp_vacations`, `dp_time_records` e `dp_esocial_events`.\n3. O usuário monitora eventuais pendências críticas (experiência vencendo, férias próximas do limite legal, rejeições de eSocial) e navega para o módulo operacional específico via atalhos dedicados.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `dp_collaborators`, `dp_contracts`, `dp_vacations`, `dp_time_records`, `dp_payroll`, `dp_esocial_events`.\n- Hooks de dados: `useRealtime` para atualização contínua de status.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Conexão com os módulos operacionais de Folha, Férias e Ponto.\n- Sincronização de status com o monitor de eventos do eSocial do Governo Federal.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso liberado para perfis autorizados em `canViewRH(role)` ou `canViewDP(role)`: SUP, ADMIN, DP, RH e DIRETORIA.\n- Usuários comuns ou colaboradores sem perfil administrativo não possuem acesso ao cockpit.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `DpPainelScreen`, `StatCard`, `Card`, `Badge`, `Button`.\n- Serviços: `src/services/dp.ts` e `src/lib/permissions.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Em caso de falha de conexão com coleções de métricas, exibe valores neutros (0 ou traço) e aciona alerta discreto sem travar o restante da interface.\n- Timeout de requisições permite recarregar individualmente os cards sem refresh completo da página.',
    },
  },

  // -------------------------------------------------------------
  // DP 2. COLABORADORES E CONTRATOS
  // -------------------------------------------------------------
  '/admin/dp/colaboradores-contratos': {
    route: '/admin/dp/colaboradores-contratos',
    title: 'Colaboradores e Contratos',
    moduleGroup: 'Departamento Pessoal (DP)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Centralizar o cadastro mestre de colaboradores, histórico contratual, processo de admissão simplificado e histórico salarial, permitindo gestão documental via anexos genéricos, links rápidos entre módulos e exportação de dados.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Colaboradores": grade analítica e cadastro completo (dados pessoais, CPF, RG, PIS/PASEP, CTPS digital, estado civil, endereço, contatos e filiação) com CRUD completo.\n- Aba "Contratos": controle de vínculos empregatícios (CLT indeterminado, determinado, aprendiz, estágio, temporário), data de admissão, término de experiência, jornada semanal e sindicato representativo.\n- Aba "Admissão Rápida": formulário ágil para pré-cadastro de admissão com validações essenciais de CPF e dados contratuais mínimos.\n- Aba "Histórico Salarial": rastreabilidade completa de alterações salariais, dissídios sindicais, enquadramentos e promoções com data de vigência e motivo.\n- Botão de Anexo de Documentos (`GenericAttachments`): upload, visualização e download de carteira de trabalho, RG, CNH, comprovante de residência e contratos assinados diretamente na ficha do colaborador.\n- Exportação (`ExportActions`): exportação dos relatórios e fichas em Excel (XLSX) e PDF estruturado com filtros ativos.\n- Atalhos Cruzados (`QuickEmployeeLinks`): navegação em um clique para espelho de ponto, programação de férias, contracheque e prontuário de exames SST do colaborador selecionado.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O CPF é obrigatório, unívoco e validado matematicamente com dígitos verificadores.\n- Cada colaborador deve possuir exatamente um contrato principal em situação "Ativo".\n- Alterações no salário-base registram automaticamente linha na coleção `dp_salary_history` para auditoria trabalhista.\n- A exclusão de colaborador é bloqueada caso existam apontamentos vinculados de ponto, folha ou eventos eSocial.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário acessa a tela `/admin/dp/colaboradores-contratos`.\n2. Na aba "Colaboradores", busca por nome, CPF ou matrícula e seleciona o registro desejado.\n3. Abre a gaveta de detalhes ou formulário de edição para atualizar dados cadastrais ou anexar comprovantes via `GenericAttachments`.\n4. Para verificar a situação de férias ou ponto do mesmo colaborador, utiliza o menu flutuante `QuickEmployeeLinks`.\n5. Emite a relação cadastral em PDF ou planilha através de `ExportActions`.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `dp_collaborators`, `dp_contracts`, `dp_salary_history`, `generic_attachments`.\n- Relacionamentos com tabelas de apoio: `cargos`, `departamentos`, `filiais`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com SST para espelhamento automático de colaboradores em exames admissionais e ASO (NR-7).\n- Integração com eSocial para geração do evento S-2200 (Cadastramento Inicial e Admissão).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização: `canViewDP(role)` (SUP, ADMIN, DP, RH).\n- Criação e Edição: restrita a operadores do Departamento Pessoal e Administradores.\n- Exclusão e alteração salarial sensível: restrita a perfil SUP e Gestor de DP.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `DpColaboradoresContratosScreen`, `GenericCrudScreen`, `GenericAttachments`, `ExportActions`, `QuickEmployeeLinks`.\n- Hooks: `useToast`, `useRealtime`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Duplicidade de CPF bloqueada com mensagem clara de erro.\n- Falhas de upload de anexos tratam tipos de arquivo inválidos ou excedentes de tamanho com feedback via toast.\n- Erros de rede durante exportação tratam paginação sem perda da seleção em tela.',
    },
  },

  // -------------------------------------------------------------
  // DP 3. JORNADA E PONTO
  // -------------------------------------------------------------
  '/admin/dp/jornada-ponto': {
    route: '/admin/dp/jornada-ponto',
    title: 'Jornada e Ponto Eletrônico',
    moduleGroup: 'Departamento Pessoal (DP)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Administrar o registro diário de jornada de trabalho, espelho de ponto eletrônico, apuração de horas extras e adicionais noturnos, controle de banco de horas (créditos/débitos) e gestão de atestados e escalas de trabalho.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Espelho de Ponto": visualização diária das marcações (entradas, saídas para intervalo, retornos e saídas), total de horas trabalhadas, atrasos e faltas conforme regras CLT.\n- Aba "Banco de Horas" (`DpBankHoursLedger`): livro razão analítico de horas acumuladas, compensações efetuadas, saldo atual positivo/negativo e prazos limites de liquidação por convenção coletiva.\n- Aba "Horas Extras" (`DpHoraExtrasScreen`): apuração detalhada de sobrejornada em dias úteis (50%), domingos e feriados (100%), adicional noturno (22h às 5h com redução da hora noturna de 52m30s) e DSR reflexo.\n- Aba "Ocorrências e Atestados": lançamento de atestados médicos, declarações de comparecimento, afastamentos legais e justificativas de ponto com abono de faltas.\n- Aba "Escalas e Turnos": parametrização de regimes de trabalho (5x2, 6x1, 12x36, turnos de revezamento), tolerâncias legais (Art. 58 § 1º CLT) e horários de descanso intrajornada.\n- Botão de Anexo de Documentos (`GenericAttachments`): upload de comprovantes e atestados médicos digitalizados associados à ocorrência.\n- Exportação (`ExportActions`): geração de espelho de ponto analítico em PDF para assinatura do empregado e relatórios em planilha Excel.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Tolerância de marcação: variações de até 5 minutos no registro de ponto, limitadas a 10 minutos diários, não são descontadas nem computadas como horas extras (Art. 58 § 1º CLT).\n- Marcações ausentes ou ímpares impedem o fechamento do espelho mensal até que sejam justificadas pelo gestor ou DP.\n- O banco de horas respeita o limite legal de compensação (máximo 6 meses no acordo individual ou 1 ano por convenção coletiva, conforme Reforma Trabalhista).\n- Horas extras realizadas em domingos e feriados não compensadas exigem acréscimo de 100% sobre a hora normal mais reflexo em DSR.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O analista de DP seleciona a competência (mês/ano) e o colaborador desejado.\n2. O espelho de ponto exibe as marcações coletadas e calcula automaticamente créditos e débitos de horas.\n3. O operador analisa inconsistências na aba "Ocorrências", vinculando atestados médicos comprobatórios via `GenericAttachments`.\n4. Na aba "Banco de Horas", confere a evolução dos saldos ou envia horas para pagamento como hora extra.\n5. Emite o espelho de ponto final em PDF via `ExportActions` para arquivamento ou coleta de assinatura.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `dp_time_records`, `dp_bank_hours`, `dp_bank_hours_ledger`, `dp_time_occurrences`, `dp_work_shifts`, `generic_attachments`.\n- Integração com dados do colaborador em `dp_collaborators`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com a Folha de Pagamento para envio das variáveis mensais de faltas, atrasos, DSR e horas extras 50%/100%.\n- Sincronização com o módulo de Saúde Ocupacional (SST) para atestados médicos superiores a 15 dias.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Visualização e lançamento de ocorrências: operadores de DP, RH e gestores imediatos com perfil autorizado.\n- Ajustes manuais de batidas e fechamento de competência de banco de horas: exclusivo DP e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `DpJornadaPontoScreen`, `DpBankHoursLedger`, `DpHoraExtrasScreen`, `GenericAttachments`, `ExportActions`, `QuickEmployeeLinks`.\n- Utilitários: cálculos de horas em `src/services/dp.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de fechamento de mês caso existam dias úteis sem marcação nem justificativa lançada.\n- Inconsistências de horário (entrada após saída) são marcadas com badge de advertência vermelho.',
    },
  },

  // -------------------------------------------------------------
  // DP 4. FÉRIAS E AFASTAMENTOS
  // -------------------------------------------------------------
  '/admin/dp/ferias-afastamentos': {
    route: '/admin/dp/ferias-afastamentos',
    title: 'Férias e Afastamentos',
    moduleGroup: 'Departamento Pessoal (DP)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Controlar integralmente a concessão e cálculo de férias individuais e coletivas, monitorar prazos de períodos aquisitivos e concessivos com alertas de dobro legal, e gerenciar licenças, auxílio-doença, maternidade e retorno ao trabalho.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Programação de Férias": agendamento de períodos de gozo, suporte a fracionamento em até 3 períodos (sendo um não inferior a 14 dias e nenhum menor que 5 dias, conforme Art. 134 § 1º CLT), opção de abono pecuniário (venda de 1/3 das férias) e cálculo do terço constitucional.\n- Aba "Vencimentos e Períodos Concessivos": monitor preventivo com semáforo de criticidade apontando dias restantes para o término do período concessivo e cálculo de indenização em dobro caso ultrapassado.\n- Aba "Afastamentos": controle de licença-maternidade (120/180 dias), auxílio-doença comum (B31), auxílio-doença acidentário (B91), licença gala, luto, militar e suspensões contratuais.\n- Aba "Retorno ao Trabalho": acompanhamento de data prevista de término de afastamento, fluxo de encaminhamento para exame médico de retorno (ASO) no módulo SST e reintegração às atividades normais.\n- Botão de Anexo de Documentos (`GenericAttachments`): arquivamento de aviso de férias assinado, recibo de pagamento, laudos periciais do INSS e atestados médicos comprobatórios.\n- Exportação (`ExportActions`): emissão do aviso prévio de férias, recibo de férias detalhado e mapa anual de férias por setor em PDF e Excel.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- É proibido o início das férias nos dois dias que antecedem feriado ou dia de repouso semanal remunerado (Art. 134 § 3º CLT).\n- O aviso de férias deve ser emitido com antecedência mínima de 30 dias da data de início do gozo (Art. 135 CLT).\n- O pagamento da remuneração das férias e do terço constitucional deve ser efetuado até 2 dias antes do início do gozo (Art. 145 CLT).\n- Afastamentos por auxílio-doença superiores a 15 dias transferem a responsabilidade de custeio para o INSS (a partir do 16º dia) e suspendem a contagem do período aquisitivo de férias caso ultrapassem 180 dias no mesmo ciclo.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O operador de DP monitora a aba "Vencimentos" e identifica colaboradores com período concessivo próximo do limite.\n2. Na aba "Programação de Férias", agenda as datas de início e término e define o eventual abono pecuniário de 10 dias.\n3. O sistema valida os limites da CLT e gera o demonstrativo de proventos e descontos.\n4. O aviso e o recibo de férias são emitidos via `ExportActions` e os comprovantes assinados são anexados em `GenericAttachments`.\n5. Os valores calculados são integrados automaticamente na folha de pagamento do mês de competência.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `dp_vacations`, `dp_absences`, `dp_collaborators`, `dp_contracts`, `generic_attachments`.\n- Dados cruzados com `dp_payroll`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Integração com a Folha de Pagamento para quitação do recibo de férias e adiantamento no contracheque.\n- Integração com eSocial para despacho dos eventos S-2230 (Afastamento Temporário - início e término).\n- Integração com SST para exames de retorno ao trabalho.',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso liberado para DP, RH, Administradores e diretores.\n- Homologação de períodos e concessão de abono restrita a operadores de DP e gestores autorizados.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `DpFeriasAfastamentosScreen`, `GenericAttachments`, `ExportActions`, `QuickEmployeeLinks`.\n- Serviços: `src/services/dp.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio automático de agendamentos que violem a regra de início em até 2 dias antes de DSR ou feriado.\n- Validação matemática de dias fracionados impedindo saldo negativo de dias de férias disponíveis.',
    },
  },

  // -------------------------------------------------------------
  // DP 5. FOLHA E BENEFÍCIOS
  // -------------------------------------------------------------
  '/admin/dp/folha-beneficios': {
    route: '/admin/dp/folha-beneficios',
    title: 'Folha de Pagamento e Benefícios',
    moduleGroup: 'Departamento Pessoal (DP)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Executar o cálculo completo da folha mensal de pagamento, emissão de contracheques/holerites, adiantamento salarial, 13º salário, processos de rescisão e reintegração com TRCT, além da administração do pacote de benefícios corporativos.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Cálculo da Folha": processamento mensal de salários, horas normais, DSR, adicionais (insalubridade, periculosidade, noturno, comissões), cálculo progressivo de INSS, desconto de IRRF com dedução por dependente e geração do líquido a pagar.\n- Aba "Holerites": emissão individual e em lote dos recibos de pagamento (contracheques) com detalhamento de proventos e descontos.\n- Aba "Adiantamento Salarial": geração da folha quinzenal (vale de até 40% do salário-base) com arquivo bancário de remessa.\n- Aba "13º Salário": cálculo da 1ª parcela (paga entre fevereiro e novembro) e 2ª parcela (até 20 de dezembro com incidência de encargos INSS e IRRF).\n- Aba "Rescisão Contratual" (`DpDismissalFlow`): assistente completo de desligamento (sem justa causa, com justa causa, pedido de demissão, acordo mútuo Art. 484-A), apuração de aviso prévio proporcional, saldo de salários, 13º e férias proporcionais/vencidas, multa do FGTS (40% ou 20%) e emissão do Termo de Rescisão do Contrato de Trabalho (TRCT).\n- Aba "Reintegração" (`DpReinstatementFlow`): reativação de vínculos por ordem judicial ou consenso administrativo com recomposição salarial retroativa.\n- Aba "Benefícios": gestão de vale-transporte (desconto teto de 6%), vale-refeição/alimentação (PAT), assistência médica e odontológica com coparticipação e seguro de vida.\n- Botão de Anexo de Documentos (`GenericAttachments`): arquivamento de TRCT assinado, comprovante de depósito rescisório, guias GRRF e recibos de benefícios assinados.\n- Exportação (`ExportActions`): exportação da folha sintética/analítica e contracheques em formato PDF e planilhas Excel para remessa bancária e conciliação financeira.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Desconto de INSS calculado segundo as faixas e alíquotas progressivas oficiais vigentes da Previdência Social.\n- IRRF apurado pela tabela progressiva da Receita Federal aplicando dedução por dependente legal e parcela a deduzir.\n- Prazo de quitação da rescisão: até 10 dias corridos a contar do término do contrato, independentemente do tipo de aviso prévio (Art. 477 § 6º CLT).\n- Desconto do vale-transporte limitado ao teto legal de 6% sobre o salário-base do trabalhador (Lei 7.418/1985).',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O analista seleciona a competência desejada e aciona o fechamento preliminar da folha.\n2. O motor lê as variáveis vindas de Ponto (horas extras, atrasos, faltas), Benefícios e Férias.\n3. O sistema calcula impostos e líquidos e apresenta o resumo analítico.\n4. O gestor confere holerites, autoriza a emissão bancária e despacha o espelho contábil para o Financeiro.\n5. Em caso de rescisão, aciona `DpDismissalFlow`, emite o TRCT via `ExportActions` e anexa as guias pagas via `GenericAttachments`.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `dp_payroll`, `dp_payroll_items`, `dp_benefits`, `dp_dismissals`, `dp_reinstatements`, `dp_collaborators`, `generic_attachments`.\n- Dados cruzados com `dp_time_records` e `dp_vacations`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Módulo Financeiro: provisão de salários e encargos no Contas a Pagar e conciliação de pagamentos.\n- Módulo Contábil: geração de lançamentos contábeis de folha e provisões de férias/13º.\n- eSocial: geração e fechamento dos eventos periódicos de remuneração (S-1200) e pagamentos (S-1210).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Acesso e cálculo de folha: estritamente controlado por `canViewDP(role)` (perfil SUP, Gestor de DP e Analista Sênior).\n- Reajustes salariais e homologação rescisória: perfil de diretoria e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `DpFolhaBeneficiosScreen`, `DpDismissalFlow`, `DpReinstatementFlow`, `GenericAttachments`, `ExportActions`, `QuickEmployeeLinks`.\n- Serviços: `src/services/dp.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Bloqueio de processamento de folha caso existam apontamentos de ponto não homologados na competência.\n- Alerta impeditivo em caso de cálculo de rescisão sem preenchimento do tipo de aviso prévio ou motivo do término.',
    },
  },

  // -------------------------------------------------------------
  // DP 6. OBRIGAÇÕES E ESOCIAL
  // -------------------------------------------------------------
  '/admin/dp/obrigacoes-esocial': {
    route: '/admin/dp/obrigacoes-esocial',
    title: 'Obrigações Trabalhistas e eSocial',
    moduleGroup: 'Departamento Pessoal (DP)',
    docVersion: '2.0.0',
    lastUpdated: '2026-04-01',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Monitorar o fluxo de mensageria e transmissão de eventos ao eSocial do Governo Federal, gerenciar guias de FGTS Digital, DCTFWeb, informes de rendimentos/DIRF e apuração dos encargos patronais (INSS, RAT/FAP, Terceiros).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Aba "Monitor eSocial" (`DpEsocialMonitor`): painel de controle dos eventos não periódicos e periódicos (S-1000 Informações do Empregador, S-1005 Tabelas de Estabelecimentos, S-1010 Rubricas, S-2200 Admissão, S-2206 Alteração Contratual, S-2299 Desligamento, S-1200 Remuneração, S-1299 Fechamento dos Eventos Periódicos) com consulta de protocolo, recibo de entrega e motivo de inconsistência.\n- Aba "FGTS Digital" (`DpFgtsDigital`): acompanhamento de guias de recolhimento via Pix Caixa, cálculo de encargos mensais e rescisórios e conciliação de depósitos vinculados por empregado.\n- Aba "DCTFWeb e DARF Previdenciária": conciliação e conferência de débitos apurados de INSS Patronal, Segurados e Terceiros/Outras Entidades (Sistema S), com geração do código de barras da DARF previdenciária unificada.\n- Aba "DIRF e Informes de Rendimentos": geração e disponibilização dos comprovantes anuais de rendimentos pagos e retenção de IRRF para a declaração de imposto de renda da pessoa física (IRPF).\n- Aba "RAIS / CAGED": consulta histórica e relatórios de conformidade das declarações já recepcionadas pelo ambiente do eSocial.\n- Aba "Apuração de Encargos e Impostos" (`DpTaxScreen`): simulador e apurador de custos de mão de obra (INSS patronal 20%, FAP multiplicado pelo RAT 1% a 3%, Terceiros 5.8% e FGTS 8%).\n- Botão de Anexo de Documentos (`GenericAttachments`): arquivamento de recibos oficiais do eSocial, comprovantes de transmissão e DARF pagas.\n- Exportação (`ExportActions`): extração de relatórios analíticos de eventos transmitidos e guias geradas em PDF e XLSX.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Evento S-2200 (Admissão) deve ser transmitido até o final do dia imediatamente anterior ao do início da prestação de serviços.\n- Fechamento dos eventos periódicos (S-1299) deve ocorrer até o dia 15 do mês subsequente ao de competência.\n- Vencimento do FGTS Digital: até o dia 20 do mês seguinte à competência (ou dia útil imediatamente anterior).\n- Rejeições retornadas pelo webservice do eSocial exigem correção cadastral imediata e retransmissão com novo número de lote.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Ao fechar a folha ou admitir/desligar colaboradores, o DP acessa `/admin/dp/obrigacoes-esocial`.\n2. Na aba "Monitor eSocial", confere a fila de lotes gerados e clica em "Transmitir Pendentes" ou consulta os recibos já deferidos.\n3. Em caso de retorno com erro do governo, examina a mensagem da tag rejeitada e corrige os dados no cadastro correspondente.\n4. Na aba "FGTS Digital" e "DCTFWeb", confere os valores devidos e gera as guias de recolhimento via código de barras/Pix.\n5. Anexa os comprovantes quitados em `GenericAttachments` e exporta o relatório de conformidade fiscal.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content:
        '- Coleções PocketBase: `dp_esocial_events`, `dp_esocial_batches`, `dp_fgts_digital`, `dp_tax_calculations`, `generic_attachments`.\n- Dados cruzados de `dp_payroll` e `dp_collaborators`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Webservice eSocial do Governo Federal via certificados digitais e-CNPJ (A1/A3).\n- Módulo Financeiro para liquidação das guias de FGTS e DARF DCTFWeb.\n- Módulo SST para monitoramento dos eventos de segurança (S-2210, S-2220, S-2240).',
    },
    permissions: {
      title: 'Permissões',
      content:
        '- Transmissão e cancelamento de eventos no eSocial: restrita a operadores sênior de DP e administradores com certificado digital habilitado (SUP, DP_ADMIN).\n- Visualização de relatórios fiscais: DP e Controladoria/Fiscal.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `DpObrigacoesEsocialScreen`, `DpEsocialMonitor`, `DpFgtsDigital`, `DpTaxScreen`, `GenericAttachments`, `ExportActions`.\n- Serviços: `src/services/dp.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Rejeições de layout ou dados inválidos (ex: código de rubrica inexistente ou CPF não localizado na base da RFB) são detalhados com descrição amigável.\n- Protocolos em processamento exibem polling automático de status até a consolidação final em recibo.',
    },
  },
}
