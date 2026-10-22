# Implementação no Skipcloud — somente produto, entrada e NF-e

## Instrução de implementação

Implementar ou completar o cadastro de produtos do ERP para DEC Eldorado e Gran Romano, com configuração por estabelecimento/empresa. Preservar o código, os cadastros e os componentes já existentes. Antes de criar tabelas, identificar o backend e o schema real do projeto; a pasta local consultada não continha as fontes.

O objetivo é dar entrada em mercadorias e emitir NF-e modelo 55 em operações internas e interestaduais. Produto de fabricação própria precisa ser identificado para a operação fiscal; não implementar ordens de produção, receitas, apontamento, WMS, força de vendas ou financeiro completo nesta tarefa.

### Modelo lógico mínimo

Reaproveitar empresas, parceiros, localidades, documentos e operações caso já existam. Os nomes abaixo são propostas, não tabelas já existentes no Skipcloud.

| Entidade                      | Chave e conteúdo essencial                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `products`                    | ID, código único, descrição, ativo, tipo/finalidade, unidade base, grupo, NCM, origem; referência externa opcional                |
| `product_company_fiscal`      | Única por empresa+produto; overrides fiscais anuláveis, perfil/grupos fiscais, CEST/benefício quando aplicável, controle por lote |
| `product_units`               | Produto+apresentação; unidade, fator, operador, GTIN, unidade tributável e conversão correspondente                               |
| `supplier_product_refs`       | Fornecedor+codigo externo+contexto; produto interno, unidade e fator validado                                                     |
| `fiscal_catalogs`             | Catálogos separados ou discriminados por domínio para NCM, CEST, CFOP, CST e cClassTrib; código textual e vigência                |
| `fiscal_operations`           | Entrada/saída, finalidade, revenda/fabricação/devolução/bonificação/transferência, regras de CFOP e efeitos no estoque            |
| `tax_rules`                   | Tributo, empresa/UFs, perfis de produto e parceiro, operação, vigência, CST/classificação, cálculo e prioridade explícita         |
| `tax_rule_selectors`          | Quando necessário, combinações de seletores; evitar copiar o campo polimórfico de restrição do legado sem identificar o tipo      |
| `fiscal_pauta_values`         | Somente para regras que usam pauta; produto, tabela/versão, vigência, valor e unidade                                             |
| `documents`, `document_items` | Cabeçalho e itens; valores comerciais e snapshot fiscal independente do cadastro corrente                                         |
| `document_item_taxes`         | Tributo+incidência por item; base, redução, alíquota, CST/classificação, valor, crédito, regra/versão e memória de cálculo        |
| `fiscal_document_artifacts`   | XML original/assinado/autorizado, chave, protocolo, ambiente, status, retorno e idempotência                                      |
| `document_references`         | Chave/documento e item de origem, quantidade relacionada e motivo da referência, sobretudo devolução                              |

Catálogos de unidade, empresa, parceiro e localidade são dependências comuns. Não duplicá-los se já existirem. Separação por empresa precisa ser aplicada também na API/autorização, não apenas no filtro da tela.

### Contrato de simulação fiscal

Entrada: empresa, data, operação, parceiro e seu perfil, UF/município de origem e destino, produto, finalidade, quantidade/unidade, valor, descontos e despesas rateadas. Usar as condições reais da entrega/operação quando divergirem do endereço cadastral.

Saída por item: CFOP, origem, CST/CSOSN conforme regime, CEST quando aplicável, ICMS, ST, FCP, DIFAL, IPI, PIS, COFINS e IBS/CBS aplicáveis, com bases, alíquotas, classificações, valores, versões das regras e explicação da seleção. Valores zerados são resultados válidos quando a regra assim determinar.

Em conflito ou ausência de regra obrigatória, retornar pendência identificada; não escolher a primeira linha do banco nem completar alíquota por suposição. A simulação é executada no backend e gera o mesmo resultado usado no XML.

### Validações de cadastro

- Permitir rascunho incompleto. Exigir dados válidos antes de disponibilizar produto para a operação fiscal que os utiliza.
- Validar NCM e demais códigos no catálogo vigente, sem converter todos os códigos em inteiros.
- Validar GTIN quando informado e manter a condição sem GTIN; referência interna não é prova de GTIN.
- Rejeitar fator de conversão zero/negativo e associação ambígua de produto do fornecedor.
- Não exigir CEST de toda mercadoria, IPI de toda saída ou uma alíquota única por produto.
- Manter vigente a regra por empresa, UF, operação, parceiro e data; preservar histórico e trilha de alteração.
- Importação de XML não pode duplicar documento ou movimentação ao repetir a requisição.
- Não alterar valores históricos autorizados quando mudar produto, NCM ou regra.
- Usar decimal exato ou estratégia equivalente compatível com o backend; definir precisão e arredondamento por campo do XML, sem depender de ponto flutuante binário de tela.

### Cenários mínimos de aceite

Estes são testes propostos, ainda não executados no novo ERP.

| Caso                                | Resultado que deve ser comprovado                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| Entrada ES→ES de revenda            | Associação do XML, operação/CFOP de entrada, unidade base e tributos do documento preservados  |
| Entrada SP→ES em caixas             | Conversão correta para unidade e quantidade base; relação fornecedor×produto recuperada        |
| Entrada de matéria-prima da Gran    | Finalidade industrialização independente da revenda; crédito tratado segundo a regra validada  |
| Venda de revenda ES→ES              | Regra interna e CFOP pertinente; conferir base reduzida quando aplicável                       |
| Venda ES→SP                         | Regra interestadual, perfil do destinatário e eventual ST/FCP/DIFAL corretamente selecionados  |
| Venda SP→SP da Gran 12              | Não herdar indevidamente a regra ES→ES                                                         |
| Venda fabricação própria da Gran 11 | Distinguir operação de fabricação própria da revenda; confrontar 5101/6101 conforme cenário    |
| Produto sujeito a ST                | Base, MVA/pauta, alíquota e FCP conforme regra; ausência de ST quando não aplicável            |
| Destinatário consumidor final       | Contribuinte e consumidor final tratados separadamente; DIFAL apenas se devido                 |
| Produto sem GTIN                    | XML aceito pelo cenário de homologação com tratamento correspondente; nunca inventar código    |
| Devolução parcial                   | Chave e item original, quantidade e impostos proporcionais; não depender só da regra atual     |
| Bonificação e transferência         | Operação específica e CFOP correspondente, sem reaproveitar cegamente venda comum              |
| IBS/CBS com redução                 | CST/cClassTrib corretos, alíquota efetiva e totais consistentes; códigos com zeros preservados |
| Reenvio após timeout                | Consulta de situação/idempotência; nenhuma segunda NF-e ou segunda entrada de estoque          |
| Troca de regra após emissão         | Documento e XML anteriores permanecem íntegros                                                 |

Usar homologação antes de transmissão em produção. Confrontar o cálculo com notas/XMLs representativos por empresa; dados históricos do Sankhya servem de referência, não como autorização automática para repetir configuração inconsistente.

### Fora do escopo atual

NFS-e, CT-e próprio, NFC-e/PDV, importação completa, IS/monofasia sem uso demonstrado, receitas/OP/produção, WMS, precificação comercial completa, comissões e criação de um novo financeiro. Integrações simples com estoque/documentos existentes continuam necessárias para registrar a entrada com consistência.

### Critério de conclusão

Cadastro e suas dependências completos; simulador fiscal auditável; entrada XML consistente e idempotente; emissão de NF-e autorizada em homologação para os cenários aplicáveis; validação do responsável fiscal das regras por empresa. O cadastro isolado não significa que a emissão esteja pronta.
