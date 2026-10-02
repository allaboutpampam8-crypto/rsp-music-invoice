import type { Invoice, BusinessSettings } from '../types/invoice'
import { generateInvoiceNumber } from './formatters'

const SETTINGS_KEY = 'rsp_invoice_settings'
const INVOICES_KEY = 'rsp_invoices_data'

export const defaultSettings: BusinessSettings = {
  businessName: 'RSP MUSIC ENTERTAINMENT',
  logoUrl: '/images/logo-rsp.png',
  instagram: 'rspmusic.id',
  email: 'rsp.music14@gmail.com',
  whatsapp: '087739103414 - 085200609411',
  bankName: 'BCA',
  accountName: 'Rieyani Okta Sumbawa',
  accountNumber: '1321045036',
  note1: 'Pelunasan Max H+1',
  note2: 'Cancel DP Hangus'
}

export const createNewEmptyInvoice = (): Invoice => {
  const today = new Date().toISOString().slice(0, 10)
  return {
    id: 'inv-' + Date.now(),
    invoiceNumber: generateInvoiceNumber(),
    clientName: '',
    eventDate: today,
    invoiceDate: today,
    items: [
      {
        id: 'item-' + Date.now(),
        descriptionTitle: '',
        details: [],
        pricelist: 0,
        dp: 0,
        diskon: 0
      }
    ],
    pelunasan: 0,
    status: 'PENDING',
    createdAt: today,
    updatedAt: today
  }
}

export const getStoredSettings = (): BusinessSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...defaultSettings,
        ...parsed,
        logoUrl: parsed.logoUrl || '/images/logo-rsp.png'
      }
    }
  } catch (e) {
    console.error('Error loading settings', e)
  }
  return defaultSettings
}

export const saveStoredSettings = (settings: BusinessSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Error saving settings', e)
  }
}

export const getStoredInvoices = (): Invoice[] => {
  try {
    const raw = localStorage.getItem(INVOICES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error('Error loading invoices', e)
  }
  return []
}

export const saveStoredInvoices = (invoices: Invoice[]): void => {
  try {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices))
  } catch (e) {
    console.error('Error saving invoices', e)
  }
}
