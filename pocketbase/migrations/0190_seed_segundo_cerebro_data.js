/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // Sementes iniciais de documentos de conhecimento corporativo do Jetro ERP
    const docsCol = app.findCollectionByNameOrId('segundo_cerebro_docs')
    const decisionsCol = app.findCollectionByNameOrId('segundo_cerebro_decisions')
    const oppCol = app.findCollectionByNameOrId('segundo_cerebro_opportunities')
    const insCol = app.findCollectionByNameOrId('segundo_cerebro_insights')

    // Documento 1: Política Comercial Jetro
    const doc1 = new Record(docsCol)
    doc1.set('title', 'Diretrizes Comerciais e Políticas de Desconto 2026')
    doc1.set('path', 'Comercial/Politicas/Diretrizes_Comerciais_2026.md')
    doc1.set('area', 'Comercial')
    doc1.set('category', 'Políticas')
    doc1.set('project', 'Estratégia Comercial 2026')
    doc1.set('tags', ['comercial', 'descontos', 'politica', 'vendas', 'precos'])
    doc1.set('wikilinks', ['Tabela de Preços Varejo e Atacado', 'Fluxo de Aprovação de Descontos'])
    doc1.set(
      'content',
      '# Diretrizes Comerciais e Políticas de Desconto 2026\n\n' +
        '## 1. Objetivo\n' +
        'Estabelecer critérios transparentes para a política de preços, prazos de pagamento e concessão de descontos comerciais no Jetro ERP.\n\n' +
        '## 2. Alçadas de Desconto\n' +
        '- Vendedor / RCA: até 5% sobre a tabela vigente.\n' +
        '- Supervisor Comercial: de 5,1% até 10%.\n' +
        '- Gerente Comercial: de 10,1% até 15%.\n' +
        '- Diretoria Comercial: descontos acima de 15% exigem aprovação formal.\n\n' +
        '## 3. Prazos Médios\n' +
        'Prazo médio padrão para faturamento comercial: 28/35/42 dias. Operações com prazos superiores a 60 dias demandam análise de crédito prévia.\n\n' +
        '## 4. Bonificações\n' +
        'Toda bonificação deve ser vinculada à verba do fornecedor ou aprovada pela gerência.',
    )
    doc1.set(
      'summary',
      'Diretrizes de alçadas de descontos, prazos médios de faturamento e regras de bonificação comercial para 2026.',
    )
    doc1.set('content_hash', $security.md5(doc1.getString('content')))
    doc1.set('sync_date', new Date().toISOString())
    doc1.set('sync_source', 'obsidian_file')
    doc1.set('confidentiality', 'Interno')
    doc1.set('status', 'ativo')
    doc1.set('author_name', 'Diretoria Comercial')
    app.save(doc1)

    // Documento 2: Procedimento de Cadastro de Cliente
    const doc2 = new Record(docsCol)
    doc2.set('title', 'Procedimento Operacional Padrão: Cadastro e Homologação de Clientes')
    doc2.set('path', 'Processos e Procedimentos/POP_Cadastro_Clientes.md')
    doc2.set('area', 'Processos e Procedimentos')
    doc2.set('category', 'POP')
    doc2.set('project', 'Padronização de Processos')
    doc2.set('tags', ['processo', 'cadastro', 'cliente', 'compliance', 'analise_credito'])
    doc2.set('wikilinks', [
      'Diretrizes Comerciais e Políticas de Desconto 2026',
      'Gestão de Inadimplência',
    ])
    doc2.set(
      'content',
      '# Procedimento: Cadastro e Homologação de Clientes\n\n' +
        '## 1. Etapas Obrigatórias\n' +
        '1. Coleta de dados cadastrais: Razão Social, CNPJ ativo, Inscrição Estadual, Contrato Social consolidado.\n' +
        '2. Consulta Sintegra e Receita Federal.\n' +
        '3. Análise de Crédito: Serasa Experian, checagem de pontualidade e referências comerciais.\n' +
        '4. Fixação de Limite de Crédito pelo departamento Financeiro no ERP.\n' +
        '5. Liberação para emissão de pedidos pela equipe de vendas.\n\n' +
        '## 2. SLA de Atendimento\n' +
        'O prazo de homologação é de até 24 horas úteis a partir do envio da documentação completa.',
    )
    doc2.set(
      'summary',
      'Fluxo de 5 etapas para validação fiscal, análise de crédito e homologação de novos clientes no ERP.',
    )
    doc2.set('content_hash', $security.md5(doc2.getString('content')))
    doc2.set('sync_date', new Date().toISOString())
    doc2.set('sync_source', 'obsidian_file')
    doc2.set('confidentiality', 'Interno')
    doc2.set('status', 'ativo')
    doc2.set('author_name', 'Controladoria e Crédito')
    app.save(doc2)

    // Documento 3: Ata de Decisão Estratégica
    const doc3 = new Record(docsCol)
    doc3.set('title', 'Ata de Reunião de Diretoria: Expansão Logística e WMS Avançado')
    doc3.set('path', 'Reuniões e Decisões/Ata_Diretoria_Logistica_2026_02.md')
    doc3.set('area', 'Reuniões e Decisões')
    doc3.set('category', 'Ata de Reunião')
    doc3.set('project', 'Expansão Logística')
    doc3.set('tags', ['diretoria', 'decisao', 'logistica', 'wms', 'investimento'])
    doc3.set('wikilinks', ['POP_Cadastro_Clientes', 'Projeto Novo Centro de Distribuição'])
    doc3.set(
      'content',
      '# Ata de Reunião de Diretoria — 12 de Fevereiro de 2026\n\n' +
        '**Presentes:** Diretoria Executiva, Gerência de Logística, Gerência de TI.\n\n' +
        '## Deliberações e Decisões Aprovadas\n' +
        '1. **Aprovação do Módulo WMS com Coletores**: Implementação de conferência cega e separação por ondas nos armazéns centrais.\n' +
        '2. **Terceirização de Roteirização**: Manter frota própria para rotas metropolitanas e parceiros para interior.\n' +
        '3. **Orçamento Aprovado**: R$ 180.000 para modernização de coletores e sinalização física de posições porta-paletes.\n\n' +
        '## Pendências e Riscos\n' +
        '- Necessidade de treinamento dos operadores de armazém antes da virada do mês.',
    )
    doc3.set(
      'summary',
      'Deliberações da diretoria aprovando investimento no módulo WMS e modelo híbrido de frota.',
    )
    doc3.set('content_hash', $security.md5(doc3.getString('content')))
    doc3.set('sync_date', new Date().toISOString())
    doc3.set('sync_source', 'obsidian_file')
    doc3.set('confidentiality', 'Estrategico')
    doc3.set('status', 'ativo')
    doc3.set('author_name', 'Secretaria de Diretoria')
    app.save(doc3)

    // Documento 4: Política de Segurança e Privacidade
    const doc4 = new Record(docsCol)
    doc4.set(
      'title',
      'Política de Privacidade e Proteção de Dados (LGPD) e Segurança da Informação',
    )
    doc4.set('path', 'Políticas e Normas Internas/Politica_LGPD_Seguranca.md')
    doc4.set('area', 'Políticas e Normas Internas')
    doc4.set('category', 'Conformidade')
    doc4.set('project', 'Governança Corporativa')
    doc4.set('tags', ['lgpd', 'seguranca', 'privacidade', 'governanca', 'auditoria'])
    doc4.set('wikilinks', ['POP_Cadastro_Clientes'])
    doc4.set(
      'content',
      '# Política de Segurança da Informação e LGPD\n\n' +
        '## 1. Princípios de Acesso\n' +
        'Acesso aos dados do ERP é estritamente baseado no princípio do menor privilégio (least privilege).\n' +
        'Todas as operações críticas, consultas analíticas e acessos a dados sensíveis são registradas em logs de auditoria imutáveis.\n\n' +
        '## 2. Tratamento de Dados Pessoais\n' +
        'Dados de parceiros PF e colaboradores possuem acesso restrito aos setores competentes (DP/RH, Financeiro e Compliance).',
    )
    doc4.set(
      'summary',
      'Norma corporativa sobre sigilo, proteção de dados e trilhas de auditoria no ERP.',
    )
    doc4.set('content_hash', $security.md5(doc4.getString('content')))
    doc4.set('sync_date', new Date().toISOString())
    doc4.set('sync_source', 'obsidian_file')
    doc4.set('confidentiality', 'Publico')
    doc4.set('status', 'ativo')
    doc4.set('author_name', 'DPO / Compliance')
    app.save(doc4)

    // Decisão Semente 1
    const dec1 = new Record(decisionsCol)
    dec1.set('subject', 'Implementação de Conferência Cega e Módulo WMS')
    dec1.set('date', '2026-02-12')
    dec1.set('context', 'Gargalos no recebimento físico de mercadorias e divergências de estoque.')
    dec1.set('responsibles', ['Diretoria Executiva', 'Gerência de Logística', 'TI'])
    dec1.set('decision', 'Aprovar aquisição de coletores e implantação de conferência cega.')
    dec1.set(
      'justification',
      'Redução do índice de avarias e divergências de inventário para menos de 0,3%.',
    )
    dec1.set('impacts', 'Capacitação de 18 colaboradores e adequação das docas de recebimento.')
    dec1.set('next_steps', 'Cronograma de treinamento e homologação dos coletores.')
    dec1.set('document_source_id', doc3.id)
    dec1.set('document_source_title', doc3.getString('title'))
    dec1.set('classification', 'Decisão aprovada')
    dec1.set('has_conflict', false)
    dec1.set('area', 'Logística e Operações')
    dec1.set('project', 'Expansão Logística')
    app.save(dec1)

    // Decisão Semente 2
    const dec2 = new Record(decisionsCol)
    dec2.set('subject', 'Revisão de Alçadas de Desconto para Canais Digitais')
    dec2.set('date', '2026-03-01')
    dec2.set('context', 'Pressão competitiva de preço no e-commerce B2B e televendas.')
    dec2.set('responsibles', ['Gerência Comercial', 'Controladoria'])
    dec2.set(
      'decision',
      'Proposta de flexibilização de margem de desconto de 5% para 7% para televendas.',
    )
    dec2.set(
      'justification',
      'Aumentar conversão de pedidos digitais sem deteriorar margem de contribuição mínima.',
    )
    dec2.set('impacts', 'Ajuste nas regras de validação automática de pedidos no ERP.')
    dec2.set('next_steps', 'Aguardando validação da diretoria financeira sobre impacto no EBITDA.')
    dec2.set('document_source_id', doc1.id)
    dec2.set('document_source_title', doc1.getString('title'))
    dec2.set('classification', 'Proposta em análise')
    dec2.set('has_conflict', true)
    dec2.set(
      'conflict_notes',
      'Diretriz Comercial 2026 fixa teto de 5% para RCA/Vendedor; a proposta de 7% conflita com o teto geral até formalização.',
    )
    dec2.set('conflict_sources', [
      { title: doc1.getString('title'), excerpt: 'Vendedor / RCA: até 5% sobre a tabela vigente.' },
    ])
    dec2.set('area', 'Comercial')
    dec2.set('project', 'Estratégia Comercial 2026')
    app.save(dec2)

    // Oportunidade Semente 1
    const opp1 = new Record(oppCol)
    opp1.set('title', 'Automação da Validação Cadastral de Clientes via Sintegra/Receita')
    opp1.set('area', 'Processos e Procedimentos')
    opp1.set('type', 'Automação')
    opp1.set(
      'description',
      'Atualmente a conferência cadastral no POP de Clientes é feita manualmente em 5 etapas pelos analistas de crédito.',
    )
    opp1.set(
      'evidence',
      'POP_Cadastro_Clientes.md prevê SLA de até 24h úteis para validações que poderiam ser executadas em segundos via API de consulta fiscal.',
    )
    opp1.set(
      'potential_impact',
      'Redução do tempo de homologação de 24h para 15 minutos e liberação de 3h diárias da equipe.',
    )
    opp1.set('priority', 'Alta')
    opp1.set(
      'recommendation',
      'Integrar endpoint de consulta automática de CNPJ no formulário de parceiros.',
    )
    opp1.set('sources', [
      {
        doc_id: doc2.id,
        title: doc2.getString('title'),
        excerpt: 'SLA de até 24 horas úteis a partir do envio',
      },
    ])
    opp1.set('status', 'Em análise')
    app.save(opp1)

    // Oportunidade Semente 2
    const opp2 = new Record(oppCol)
    opp2.set(
      'title',
      'Eliminação de Divergência entre Política Comercial e Teto de Desconto de Televendas',
    )
    opp2.set('area', 'Comercial')
    opp2.set('type', 'Inconsistência documental')
    opp2.set(
      'description',
      'Proposta de 7% de desconto em análise para televendas diverge da Diretriz Comercial 2026 vigente (limite 5%).',
    )
    opp2.set(
      'evidence',
      'Diretrizes Comerciais 2026 (item 2) vs. Proposta de Revisão de Alçadas de Televendas.',
    )
    opp2.set(
      'potential_impact',
      'Evita pedidos bloqueados indevidamente na esteira de aprovação comercial.',
    )
    opp2.set('priority', 'Média')
    opp2.set(
      'recommendation',
      'Unificar aditivo formal na política comercial antes de parametrizar o motor de regras.',
    )
    opp2.set('sources', [
      {
        doc_id: doc1.id,
        title: doc1.getString('title'),
        excerpt: 'Alçadas de Desconto Vendedor / RCA: até 5%',
      },
    ])
    opp2.set('status', 'Em análise')
    app.save(opp2)

    // Insight Semente 1
    const ins1 = new Record(insCol)
    ins1.set('title', 'Alinhamento Estratégico Logística × Comercial para o 2º Trimestre')
    ins1.set('department', 'Logística e Operações')
    ins1.set('category', 'Oportunidade')
    ins1.set(
      'content',
      'A implantação do WMS com separação por ondas permitirá antecipar o horário de corte dos pedidos comerciais das 15h para as 17h.',
    )
    ins1.set(
      'evidence',
      'Ata de Diretoria 12/02/2026 registrou ganho previsto de 35% na velocidade de separação com coletores.',
    )
    ins1.set(
      'recommendations',
      'Coordenar com a equipe de vendas o anúncio do novo horário de corte somente após 30 dias de operação estável do WMS.',
    )
    ins1.set('sources', [{ doc_id: doc3.id, title: doc3.getString('title') }])
    ins1.set('status', 'Validado')
    ins1.set('active', true)
    app.save(ins1)

    console.log('0190_seed_segundo_cerebro_data applied successfully')
  },
  (app) => {
    // Sementes idempotentes
  },
)
