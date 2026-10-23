import type { ScreenDocEntry } from './types'

export const CADASTROS_SCREEN_DOCS: Record<string, ScreenDocEntry> = {
  '/admin/cadastros/filiais': {
    route: '/admin/cadastros/filiais',
    title: 'Cadastro de Filiais',
    moduleGroup: 'Organização',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar as filiais operacionais vinculadas às empresas matrizes do grupo Huram, mantendo dados cadastrais de localização, CNPJ, inscrição estadual, contatos e responsabilidade administrativa.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Listagem completa de filiais com código sequencial, nome da filial, empresa matriz vinculada, CNPJ, situação (Ativo/Inativo) e responsável.\n- Filtro por status e busca rápida por nome, código ou CNPJ.\n- Formulário padrão via CadastroFormDialog com campos: Empresa Matriz, CNPJ, Inscrição Estadual, Endereço, Cidade, Estado, Telefone e Responsável.\n- Botão "Baixar Modelo Excel": geração de planilha .xlsx oficial da tela, contendo aba "Dados" com cabeçalho destacado e linhas de exemplo realistas, além da aba "Instruções" com regras de preenchimento e dicionário de campos.\n- Botão "Importar Excel": upload de arquivo .xlsx, validação linha a linha prévia antes da gravação (campos obrigatórios, CNPJ válido com dígito verificador, duplicados na planilha e no banco de dados, vínculo com empresa existente), prévia em duas listas (válidos × erros legíveis) e gravação em lotes (chunks) com auditoria na coleção audit_logs.\n- Exportação de dados para Excel e ações de visualização, edição, duplicação e ativação/inativação.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Toda filial deve possuir vínculo com uma Empresa Matriz cadastrada.\n- O CNPJ informado deve possuir 14 dígitos e dígitos verificadores válidos conferidos pelo algoritmo oficial da Receita Federal (módulo 11).\n- Importação estritamente aditiva: apenas cria novos registros, nunca altera ou exclui dados preexistentes.\n- Duplicidades de CNPJ ou Código contra o banco ou dentro da mesma planilha são bloqueadas na prévia e ignoradas na gravação.\n- O isolamento multiempresa e as permissões de acesso respeitam o contexto do usuário autenticado.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O operador acessa Cadastros > Filiais no menu lateral.\n2. Para carga em lote, clica em "Baixar Modelo Excel" e preenche os dados conforme as orientações.\n3. Clica em "Importar Excel", seleciona a planilha .xlsx e aguarda a validação automática.\n4. O sistema exibe o painel de prévia com registros válidos e linhas com erro detalhado linha a linha.\n5. O operador clica em "Confirmar Importação", gravando em lotes e registrando o log em audit_logs.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleção PocketBase: `filiais`.\n- Auditoria de importação: `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content:
        '- Motor único de importação Excel (`src/services/excel-import-service.ts`) com biblioteca xlsx.\n- Validador oficial de CNPJ (`src/services/cnpj-service.ts`).\n- Registro central de auditoria (`src/services/audit-logs.ts`).',
    },
    permissions: {
      title: 'Permissões',
      content: 'Acesso conforme perfil de Cadastros/Configurações (`canViewConfiguracoes(role)`).',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- Componentes: `CadastroStandardScreen`, `ExcelImportDialog`, `CadastroFormDialog`, `JetroTable`.\n- Configuração: `cadastros-config.ts` (key `filiais`).',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Prévia clara com linhas de erro apontando o motivo exato (ex: CNPJ inválido, empresa inexistente, duplicidade).\n- Permite corrigir a planilha e reenviar antes de efetivar a gravação.',
    },
  },

  '/admin/cadastros/transportadoras': {
    route: '/admin/cadastros/transportadoras',
    title: 'Cadastro de Transportadoras',
    moduleGroup: 'Pessoas',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Cadastrar operadores logísticos e transportadoras terceirizadas para expedição de pedidos e entregas intermunicipais/interestaduais.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Gestão cadastral completa: Razão Social, Nome Fantasia, CNPJ, Telefone, E-mail, Tipo de Transporte, Regiões Atendidas e Prazo Médio (dias).\n- Botão "Baixar Modelo Excel": planilha .xlsx customizada para transportadoras com colunas obrigatórias destacadas (*), aba de Instruções e 2 exemplos de frotas rodoviárias/fracionadas.\n- Botão "Importar Excel": motor com validação rigorosa de CNPJ (dígitos verificadores), e-mail, duplicidade no arquivo e no banco, prévia visual e gravação em chunks com log de auditoria.\n- Listagem via JetroTable com ordenação, busca rápida e exportação.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Razão Social e CNPJ são campos obrigatórios.\n- Validação matemática de CNPJ com dígito verificador.\n- Transportadoras já existentes no sistema (mesmo CNPJ ou Código) são ignoradas com aviso de duplicidade e não são sobrescritas.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O usuário baixa a planilha modelo pela tela de transportadoras.\n2. Informa razão social, CNPJ e regiões atendidas.\n3. Faz o upload da planilha; o sistema valida formatos, CNPJ e duplicidades.\n4. Na confirmação, o motor cria os registros na coleção `transportadoras` e gera o registro em `audit_logs`.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleção PocketBase: `transportadoras`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor de importação Excel (xlsx), validação de CNPJ e auditoria corporativa.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Acesso liberado a operadores comerciais/logísticos e perfil SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content:
        '- `CadastroStandardScreen`, `ExcelImportDialog`, `excel-import-service.ts`, `cadastros-config.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- CNPJ incorreto é destacado com mensagem amigável no painel de prévia sem travar a importação dos demais registros válidos.',
    },
  },

  '/admin/cadastros/vendedores': {
    route: '/admin/cadastros/vendedores',
    title: 'Cadastro de Vendedores',
    moduleGroup: 'Pessoas',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Administrar a equipe de vendas direta (interna e externa), parâmetros de comissionamento, região de atuação e supervisão comercial.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Registro de vendedores com CPF/CNPJ, tipo (Interno/Externo), região, supervisor, percentual de comissão, telefone e e-mail.\n- Botão "Baixar Modelo Excel" com exemplos de vendedores internos e externos, opções de seleção e instruções de preenchimento.\n- Botão "Importar Excel" com validação completa de CPF/CNPJ (dígitos verificadores), e-mail, duplicidade e prévia em duas listas antes de gravar em lotes.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Validação de CPF (11 dígitos) ou CNPJ (14 dígitos) com cálculo de dígito verificador.\n- Tipo de vendedor restrito às opções válidas ("Interno" ou "Externo").\n- Importação estritamente aditiva com isolamento de dados.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. O gestor comercial baixa o modelo de vendedores em Excel.\n2. Preenche os dados dos vendedores da equipe e anexa a planilha na tela.\n3. Valida a lista prévia e confirma a importação com auditoria.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleção PocketBase: `vendedores`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor único de importação Excel com rastreabilidade em `audit_logs`.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Acesso restrito ao módulo Comercial e administradores SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- `CadastroStandardScreen`, `ExcelImportDialog`, `cadastros-config.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Documento inválido (CPF/CNPJ incorreto) e duplicidade são sinalizados com a linha exata da planilha.',
    },
  },

  '/admin/cadastros/representantes': {
    route: '/admin/cadastros/representantes',
    title: 'Cadastro de Representantes',
    moduleGroup: 'Pessoas',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Gerenciar representantes comerciais autônomos e pessoas jurídicas credenciadas para prospecção e vendas regionais.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Gestão de representantes: Razão/Nome, CPF/CNPJ, tipo (Comercial/Técnico), região de atendimento, supervisor, comissão, telefone e e-mail.\n- Botão "Baixar Modelo Excel" gerando planilha com orientações, regras e exemplos.\n- Botão "Importar Excel" com verificação de CPF/CNPJ, formatos, detecção de duplicados no banco e na planilha e tela de prévia dividida entre válidos e erros.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Validação algorítmica de CPF/CNPJ com dígito verificador.\n- Opções de tipo restritas a "Comercial" ou "Técnico".\n- Registros existentes são ignorados e não sobrescritos.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        'Upload da planilha .xlsx, validação em lote, confirmação e geração de log em `audit_logs`.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções PocketBase: `representantes`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor Excel `xlsx`, `cnpj-service.ts`, `audit-logs.ts`.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Comercial e perfis administrativos autorizados.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- `CadastroStandardScreen`, `ExcelImportDialog`, `cadastros-config.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Detalhamento de inconsistências linha a linha com suporte a reenvio após correção.',
    },
  },

  '/admin/cadastros/perfis-permissoes': {
    route: '/admin/cadastros/perfis-permissoes',
    title: 'Perfis e Permissões de Acesso',
    moduleGroup: 'Organização',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Definir matriz de acessos, papéis corporativos e permissões modulares de segurança do ERP Huram.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Gestão de perfis com nome, descrição e permissões em formato estruturado (JSON).\n- Matriz unificada de permissões por módulo funcional.\n- Botões "Baixar Modelo Excel" e "Importar Excel" disponíveis EXCLUSIVAMENTE para o perfil de Superusuário (SUP), garantindo a governança de segurança.\n- Validação de unicidade e gravação auditada com logs detalhados em `audit_logs`.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Botões de importação e exportação de perfis são restritos e visíveis apenas para usuários autenticados com papel SUP.\n- Nomes de perfil duplicados são barrados na validação prévia.\n- Operação estritamente aditiva.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Usuário com papel SUP acessa a tela de Perfis e Permissões.\n2. Pode baixar a planilha modelo .xlsx e importar perfis em lote com prévia de validação e confirmação auditada.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções PocketBase: `perfis_permissoes`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor de importação Excel com controle estrito de RBAC/SUP.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Importação/Exportação restrita estritamente ao perfil SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- `CadastroStandardScreen`, `ExcelImportDialog`, `cadastros-config.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Bloqueio de duplicidades de nome de perfil com apontamento da linha na planilha.',
    },
  },

  '/admin/cadastros/categorias': {
    route: '/admin/cadastros/categorias',
    title: 'Cadastro de Categorias de Produtos',
    moduleGroup: 'Produtos & Serviços',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Estruturar a árvore de classificação mercadológica dos itens do estoque, separando matérias-primas, insumos, produtos acabados e serviços.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cadastro e listagem de categorias com código, nome e descrição.\n- Botão "Baixar Modelo Excel": geração de planilha .xlsx com exemplos práticos (Matérias-Primas, Produtos Acabados) e instruções.\n- Botão "Importar Excel": leitura do arquivo, validação contra duplicados no banco e no arquivo, prévia de registros e gravação em chunks auditada.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O nome da categoria é obrigatório e único.\n- Importação estritamente aditiva: se uma categoria já existir no banco, é ignorada com status de duplicada.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        'Baixar modelo, preencher nomes e descrições, validar planilha na prévia e confirmar importação.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções PocketBase: `categorias`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor único de importação Excel (`excel-import-service.ts`).',
    },
    permissions: {
      title: 'Permissões',
      content: 'Usuários com permissão de gestão de produtos/estoque e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- `CadastroStandardScreen`, `ExcelImportDialog`, `cadastros-config.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Exibição clara de categorias duplicadas no relatório de validação.',
    },
  },

  '/admin/cadastros/subcategorias': {
    route: '/admin/cadastros/subcategorias',
    title: 'Cadastro de Subcategorias',
    moduleGroup: 'Produtos & Serviços',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Subdividir as categorias de produtos em famílias de itens específicas, garantindo a organização do catálogo e relatórios de vendas.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Gestão de subcategorias vinculadas à Categoria mãe correspondente.\n- Botão "Baixar Modelo Excel" com campo obrigatório de Categoria Mãe e instruções detalhadas.\n- Botão "Importar Excel" com validação de vínculo relacional: se o nome da categoria informada não existir no cadastro de Categorias, a linha é reprovada na prévia com mensagem descritiva antes da gravação.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Vínculo relacional obrigatório com Categoria mãe existente.\n- Não sobrescreve subcategorias pré-existentes.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        'Upload da planilha, validação relacional de Categoria, visualização da prévia e gravação com log em audit_logs.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções PocketBase: `subcategorias`, `categorias`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Resolução relacional em `excel-import-service.ts`.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Acesso conforme perfil de Cadastros/Estoque.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- `CadastroStandardScreen`, `ExcelImportDialog`, `cadastros-config.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Alerta imediato "Vínculo inexistente: Categoria não encontrada".',
    },
  },

  '/admin/cadastros/marcas': {
    route: '/admin/cadastros/marcas',
    title: 'Cadastro de Marcas',
    moduleGroup: 'Produtos & Serviços',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Cadastrar as marcas dos fabricantes e linhas proprietárias de produtos comercializados pela empresa.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cadastro de marcas com código, nome e descrição.\n- Botão "Baixar Modelo Excel" com modelo oficial .xlsx e aba de instruções.\n- Botão "Importar Excel" com conferência de duplicidade, formatos e prévia de validação.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Nome da marca obrigatório.\n- Não permite inclusão duplicada de marcas com mesmo nome ou código.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content: 'Download de modelo, preenchimento, upload, validação prévia e confirmação.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleção PocketBase: `marcas`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor único de importação Excel.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Gestores de produto, compradores e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- `CadastroStandardScreen`, `ExcelImportDialog`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Registro de inconsistências na listagem de erros da prévia.',
    },
  },

  '/admin/cadastros/unidades-medida': {
    route: '/admin/cadastros/unidades-medida',
    title: 'Unidades de Medida',
    moduleGroup: 'Produtos & Serviços',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Padronizar as unidades de medida físicas utilizadas em compras, produção, estoque e faturamento fiscal (ex: UN, KG, M, L, CX).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cadastro com nome, descrição e abreviação oficial (sigla padronizada).\n- Botão "Baixar Modelo Excel" com exemplos oficiais (UN, KG, M).\n- Botão "Importar Excel" com validação de campos obrigatórios (nome, abreviação), duplicidade e importação auditada.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Abreviação e descrição são de preenchimento obrigatório.\n- Importação aditiva que não duplica siglas existentes.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        'Carga em lote via planilha Excel .xlsx com prévia de linhas válidas e inválidas antes da gravação.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleção PocketBase: `unidades_medida`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor único de importação Excel.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Operadores fiscais, estoque e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- `CadastroStandardScreen`, `ExcelImportDialog`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Validação de sigla/abreviação ausente exibida linha a linha.',
    },
  },

  '/admin/cadastros/centros-custo': {
    route: '/admin/cadastros/centros-custo',
    title: 'Centros de Custo',
    moduleGroup: 'Financeiro',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Estruturar os departamentos e unidades de apropriação de receitas e despesas gerenciais para a Controladoria e Financeiro.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cadastro de centros de custo associados a Empresa, Filial e Responsável.\n- Botão "Baixar Modelo Excel" com orientações de preenchimento e exemplos práticos de fábricas e departamentos.\n- Botão "Importar Excel" com validação de vínculos de Empresa e Filial: se o nome indicado não constar no sistema, o erro é apontado na prévia.\n- Gravação em chunks e auditoria.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Vínculos de Empresa e Filial devem apontar para cadastros ativos no sistema.\n- Apenas inclui novos centros de custo sem alterar os existentes.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        'Upload da planilha modelo, validação relacional de empresa/filial, confirmação e geração de log em audit_logs.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções PocketBase: `centros_custo`, `empresas`, `filiais`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor de importação Excel e módulo financeiro/controladoria.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Gestores financeiros, controllers e perfil SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- `CadastroStandardScreen`, `ExcelImportDialog`, `cadastros-config.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Notificação na prévia se a empresa ou filial associada não existir no ERP.',
    },
  },

  '/admin/cadastros/plano-contas': {
    route: '/admin/cadastros/plano-contas',
    title: 'Plano de Contas Gerencial e Contábil',
    moduleGroup: 'Financeiro',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Estruturar as contas contábeis e gerenciais (Ativo, Passivo, Receita, Despesa e Patrimônio Líquido) para classificação de lançamentos financeiros e DRE.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Manutenção da árvore contábil: Código, Nome da Conta, Tipo (Ativo, Passivo, Receita, Despesa, Patrimônio Líquido), Conta Pai (Código), Natureza (Devedora/Credora) e Aceita Lançamentos.\n- Botão "Baixar Modelo Excel" com valores permitidos de tipo/natureza e linhas de exemplo.\n- Botão "Importar Excel" com validação da Conta Pai: verifica se o código pai existe no Plano de Contas, validando também valores aceitos no select e unicidade de código contábil.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O código da conta deve ser único no plano.\n- Tipo restrito às opções contábeis padrão.\n- Se informada Conta Pai, ela deve existir previamente no sistema.\n- Importação estritamente aditiva.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        'Download do modelo, alimentação da árvore de contas, validação na prévia de importação e carga em lote no PocketBase com auditoria.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleção PocketBase: `plano_contas`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor único de importação Excel com checagem hierárquica.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Controladoria, Contabilidade e perfil SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- `CadastroStandardScreen`, `ExcelImportDialog`, `cadastros-config.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content:
        '- Conta pai inexistente ou código já existente no banco são reportados com precisão.',
    },
  },

  '/admin/cadastros/bancos': {
    route: '/admin/cadastros/bancos',
    title: 'Cadastro de Bancos e Instituições Financeiras',
    moduleGroup: 'Financeiro',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Cadastrar as instituições financeiras e códigos de compensação bancária (COMPE) para emissão de cobranças, transferências e conciliação.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Cadastro com Código COMPE (ex: 001 - Banco do Brasil, 341 - Itaú, 033 - Santander) e Nome do Banco.\n- Botão "Baixar Modelo Excel" com instruções e exemplos de bancos regulados pelo Banco Central.\n- Botão "Importar Excel" com validação de duplicidade por código e nome, tela de prévia e gravação em lote auditada.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Nome do banco obrigatório.\n- Códigos de banco já cadastrados são ignorados para evitar duplicidade de instituição financeira.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content: 'Carga rápida de catálogo de instituições financeiras via arquivo Excel .xlsx.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleção PocketBase: `bancos`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor único de importação Excel (`excel-import-service.ts`).',
    },
    permissions: {
      title: 'Permissões',
      content: 'Financeiro e administradores.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- `CadastroStandardScreen`, `ExcelImportDialog`, `cadastros-config.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Bancos duplicados são listados na lista de ignorados/erros da prévia.',
    },
  },

  '/admin/cadastros/contas-bancarias': {
    route: '/admin/cadastros/contas-bancarias',
    title: 'Cadastro de Contas Bancárias',
    moduleGroup: 'Financeiro',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Cadastrar e gerenciar as contas correntes, poupanças e aplicações das empresas do grupo Huram para controle de tesouraria e conciliação.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Informações da conta: Banco, Agência, Número da Conta, Tipo (Corrente, Poupança, Salário), Empresa, Filial e Saldo Inicial.\n- Botão "Baixar Modelo Excel" contendo valores permitidos de tipo de conta, orientações de vínculo com Banco e Empresa e exemplos de preenchimento.\n- Botão "Importar Excel" com validação de vínculo com Banco cadastrado e Empresa existente no ERP, além de prévia e gravação em chunks.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O banco informado na planilha deve existir no cadastro de Bancos.\n- Agência e Conta são de preenchimento obrigatório.\n- Não sobrescreve contas existentes.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        '1. Operador financeiro baixa a planilha modelo.\n2. Informa dados das contas bancárias das filiais.\n3. Envia o arquivo para validação automática de vínculos de Banco e Empresa.\n4. Confirma a inclusão das contas no sistema.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções PocketBase: `contas_bancarias`, `bancos`, `empresas`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor único de importação Excel com checagem de banco e empresa.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Acesso restrito ao perfil Financeiro, Tesouraria e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- `CadastroStandardScreen`, `ExcelImportDialog`, `cadastros-config.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Inconsistência de banco não localizado na base é indicada no painel de prévia.',
    },
  },

  '/admin/cadastros/formas-pagamento': {
    route: '/admin/cadastros/formas-pagamento',
    title: 'Formas de Pagamento',
    moduleGroup: 'Financeiro',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Parametrizar os meios de liquidação financeira aceitos em vendas e compras (Dinheiro, PIX, Cartão Crédito, Cartão Débito, Boleto, Transferência, Cheque).',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Configuração com Nome, Tipo de meio de pagamento e indicador se gera financeiro automático no Contas a Receber/Pagar.\n- Botão "Baixar Modelo Excel" com opções fixas de Tipo permitidas e instruções claras.\n- Botão "Importar Excel" com validação dos tipos permitidos, flag booleana e detecção de duplicidades.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- O tipo deve coincidir estritamente com os meios aceitos pelo sistema.\n- Importação estritamente aditiva.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content: 'Validação e importação em lote a partir do modelo .xlsx com auditoria.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções PocketBase: `formas_pagamento`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor único de importação Excel.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Financeiro, Comercial e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- `CadastroStandardScreen`, `ExcelImportDialog`, `cadastros-config.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Tipos de pagamento inválidos são listados com as opções aceitas.',
    },
  },

  '/admin/cadastros/condicoes-pagamento': {
    route: '/admin/cadastros/condicoes-pagamento',
    title: 'Condições de Pagamento',
    moduleGroup: 'Financeiro',
    docVersion: '1.3.0',
    lastUpdated: '2026-04-14',
    author: 'Engenharia de Software Huram',
    objective: {
      title: 'Objetivo',
      content:
        'Definir os planos de parcelamento, prazos e percentuais de entrada para pedidos de venda e contratos de fornecimento.',
    },
    features: {
      title: 'Funcionalidades',
      content:
        '- Parametrização com Nome (ex: 30/60/90 Dias), Quantidade de Parcelas, Intervalo em Dias e Entrada (%).\n- Botão "Baixar Modelo Excel" com exemplos práticos (À Vista, Parcelado, Com Entrada) e regras de preenchimento numérico.\n- Botão "Importar Excel" com validação de números válidos, obrigatórios e prévia completa.',
    },
    businessRules: {
      title: 'Regras de Negócio',
      content:
        '- Quantidade de parcelas e intervalo em dias devem ser números válidos.\n- Não sobrescreve condições existentes.',
    },
    workflow: {
      title: 'Fluxo de Funcionamento',
      content:
        'Download de modelo, preenchimento dos prazos, validação e gravação em lote auditada.',
    },
    dataSource: {
      title: 'Origem dos Dados',
      content: '- Coleções PocketBase: `condicoes_pagamento`, `audit_logs`.',
    },
    integrations: {
      title: 'Integrações',
      content: '- Motor único de importação Excel.',
    },
    permissions: {
      title: 'Permissões',
      content: 'Financeiro, Comercial e SUP.',
    },
    dependencies: {
      title: 'Dependências',
      content: '- `CadastroStandardScreen`, `ExcelImportDialog`, `cadastros-config.ts`.',
    },
    errorHandling: {
      title: 'Tratamento de Erros',
      content: '- Valores não numéricos nas parcelas ou prazos são reportados com precisão.',
    },
  },
}
