# Relatório Técnico do Domínio 10 — Fiscal

> **Domínio:** 10 — Fiscal
> **Framework:** FCP-MODULAR v1.0

---

## 1. Visão Geral

Cobra NF-e, NFC-e, NFS-e, CT-e, MDF-e, apuração, reforma tributária, SPED.

**Tipo:** Fato Comprovado — verificado via schema (collections fiscais), `src/components/fiscal/`, e hooks (`contabil_process_lote`).

---

## 2. Funcionalidades

### 2.1 Collections Fiscais

`nfe_records`, `nfce_records` no schema. Collections fiscais criadas nas migrações 0067-0068.
**Tipo:** Fato Comprovado

### 2.2 Reforma Tributária

Implementação de CBS, IBS, Imposto Seletivo com dashboard, simulador, regras, transição, créditos e validação.
**Tipo:** Fato Comprovado

### 2.3 Componentes

`FiscalLayout`, `FiscalDashboard`, `NfsePanel`, `CtePanel`, `MdfePanel`, `ApuracaoPanel`, `ReformaDashboard`, `ReformaSimulador`, `CartaCorrecao`, `ManifestacaoDestinatario`, `DocumentosFiscais`, `RelatoriosFiscais`.
**Tipo:** Fato Comprovado

---

## 3. Não Conformidades

### NC-HIGH-011: Sem Integração SEFAZ

**Severidade:** Alta | **Evidência:** NF-e/NFC-e são mock; sem hooks de comunicação com SEFAZ | **Impacto:** Documentos fiscais não autorizados

### NC-HIGH-012: Sem SPED

**Severidade:** Alta | **Evidência:** Tela de SPED existe mas sem hook que gera arquivos | **Impacto:** Conformidade fiscal não atendida

### NC-MED-011: Sem Certificados Digitais

**Severidade:** Média | **Evidência:** Tela de certificados existe mas sem integração com certificado A1/A3 | **Impacto:** Assinatura digital não funcional

---

## 4. Conclusão

Módulo fiscal bem estruturado conceitualmente com implementação avançada da reforma tributária. Principal lacuna é integração SEFAZ e SPED.

**Tipo:** Fato Comprovado
