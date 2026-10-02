export interface InvoiceItem {
  id: string
  descriptionTitle: string
  details: string[] // e.g. ["2 Penyanyi", "1 Keyboard", "1 Saxo", "1 Sound + Genset"]
  pricelist: number
  dp: number
  diskon: number
}

export interface BusinessSettings {
  businessName: string
  logoUrl?: string
  instagram: string
  email: string
  whatsapp: string
  bankName: string
  accountName: string
  accountNumber: string
  note1: string
  note2: string
}

export interface Invoice {
  id: string
  invoiceNumber: string // e.g. "#RSP0202639"
  clientName: string // e.g. "Nisa - Bantarbolang"
  eventDate: string // e.g. "2026-11-23" or formatted
  invoiceDate: string // e.g. "2026-09-25"
  items: InvoiceItem[]
  pelunasan: number
  status: 'PENDING' | 'DP' | 'LUNAS'
  createdAt: string
  updatedAt: string
}
