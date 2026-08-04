export interface ParsedNFeItem {
  code: string
  product: string
  quantity: string
  unit_price: string
  total: string
  tax: string
}

export interface ParsedNFe {
  invoice_number: string
  invoice_series: string
  invoice_key: string
  supplier_cnpj: string
  supplier_name: string
  items: ParsedNFeItem[]
  total_value: string
}

export function parseNFeXml(xml: string): ParsedNFe | null {
  try {
    const doc = new DOMParser().parseFromString(xml, 'text/xml')
    const getText = (parent: Element | Document, tag: string) =>
      parent.getElementsByTagName(tag)[0]?.textContent?.trim() || ''
    const emit = doc.getElementsByTagName('emit')[0]
    const detList = Array.from(doc.getElementsByTagName('det'))
    const items: ParsedNFeItem[] = detList.map((det) => {
      const prod = det.getElementsByTagName('prod')[0]
      if (!prod) return { code: '', product: '', quantity: '', unit_price: '', total: '', tax: '' }
      return {
        code: getText(prod, 'cProd'),
        product: getText(prod, 'xProd'),
        quantity: getText(prod, 'qCom'),
        unit_price: getText(prod, 'vUnCom'),
        total: getText(prod, 'vProd'),
        tax: det.getElementsByTagName('vICMS')[0]?.textContent?.trim() || '',
      }
    })
    const infNFe = doc.getElementsByTagName('infNFe')[0]
    const key = infNFe?.getAttribute('Id')?.replace('NFe', '') || ''
    return {
      invoice_number: getText(doc, 'nNF'),
      invoice_series: getText(doc, 'serie'),
      invoice_key: key,
      supplier_cnpj: emit ? getText(emit, 'CNPJ') : '',
      supplier_name: emit ? getText(emit, 'xNome') : '',
      items,
      total_value: doc.getElementsByTagName('vNF')[0]?.textContent?.trim() || '',
    }
  } catch {
    return null
  }
}
