import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Invoice, BusinessSettings } from '../types/invoice'
import {
  getStoredInvoices,
  saveStoredInvoices,
  getStoredSettings,
  saveStoredSettings
} from './storage'

// Map database row to Invoice model
const mapRowToInvoice = (row: any): Invoice => ({
  id: row.id,
  invoiceNumber: row.invoice_number,
  clientName: row.client_name || '',
  eventDate: row.event_date || '',
  invoiceDate: row.invoice_date || '',
  items: Array.isArray(row.items) ? row.items : [],
  pelunasan: Number(row.pelunasan) || 0,
  status: row.status || 'PENDING',
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString()
})

// Map Invoice model to database row
const mapInvoiceToRow = (invoice: Invoice) => ({
  id: invoice.id,
  invoice_number: invoice.invoiceNumber,
  client_name: invoice.clientName,
  event_date: invoice.eventDate,
  invoice_date: invoice.invoiceDate,
  items: invoice.items,
  pelunasan: invoice.pelunasan,
  status: invoice.status,
  updated_at: new Date().toISOString()
})

// Map database row to BusinessSettings
const mapRowToSettings = (row: any): BusinessSettings => ({
  businessName: row.business_name,
  logoUrl: row.logo_url || '/images/logo-rsp.png',
  instagram: row.instagram || '',
  email: row.email || '',
  whatsapp: row.whatsapp || '',
  bankName: row.bank_name || '',
  accountName: row.account_name || '',
  accountNumber: row.account_number || '',
  note1: row.note1 || '',
  note2: row.note2 || ''
})

// Map BusinessSettings to database row
const mapSettingsToRow = (settings: BusinessSettings) => ({
  id: 'default',
  business_name: settings.businessName,
  logo_url: settings.logoUrl,
  instagram: settings.instagram,
  email: settings.email,
  whatsapp: settings.whatsapp,
  bank_name: settings.bankName,
  account_name: settings.accountName,
  account_number: settings.accountNumber,
  note1: settings.note1,
  note2: settings.note2,
  updated_at: new Date().toISOString()
})

// ================= API METHODS =================

export const fetchCloudInvoices = async (): Promise<Invoice[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return getStoredInvoices()
  }

  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase fetch invoices error, fallback to local:', error.message)
      return getStoredInvoices()
    }

    if (data) {
      const mapped = data.map(mapRowToInvoice)
      saveStoredInvoices(mapped) // Cache locally
      return mapped
    }
  } catch (err) {
    console.error('Network error fetching invoices:', err)
  }

  return getStoredInvoices()
}

export const saveCloudInvoice = async (invoice: Invoice): Promise<void> => {
  // Always update local cache first for instant UI response
  const localList = getStoredInvoices()
  const existingIdx = localList.findIndex((i) => i.id === invoice.id)
  let updatedList: Invoice[]
  if (existingIdx >= 0) {
    updatedList = [...localList]
    updatedList[existingIdx] = invoice
  } else {
    updatedList = [invoice, ...localList]
  }
  saveStoredInvoices(updatedList)

  if (!isSupabaseConfigured || !supabase) return

  try {
    const row = mapInvoiceToRow(invoice)
    const { error } = await supabase.from('invoices').upsert(row)
    if (error) {
      console.error('Error saving invoice to Supabase:', error.message)
    }
  } catch (err) {
    console.error('Error saving invoice to cloud:', err)
  }
}

export const deleteCloudInvoice = async (id: string): Promise<void> => {
  // Delete from local cache
  const localList = getStoredInvoices().filter((i) => i.id !== id)
  saveStoredInvoices(localList)

  if (!isSupabaseConfigured || !supabase) return

  try {
    const { error } = await supabase.from('invoices').delete().eq('id', id)
    if (error) {
      console.error('Error deleting invoice from Supabase:', error.message)
    }
  } catch (err) {
    console.error('Error deleting invoice from cloud:', err)
  }
}

export const fetchCloudSettings = async (): Promise<BusinessSettings> => {
  if (!isSupabaseConfigured || !supabase) {
    return getStoredSettings()
  }

  try {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    if (error) {
      console.warn('Supabase fetch settings error:', error.message)
      return getStoredSettings()
    }

    if (data) {
      const mapped = mapRowToSettings(data)
      saveStoredSettings(mapped)
      return mapped
    }
  } catch (err) {
    console.error('Error fetching settings from cloud:', err)
  }

  return getStoredSettings()
}

export const saveCloudSettings = async (settings: BusinessSettings): Promise<void> => {
  saveStoredSettings(settings)

  if (!isSupabaseConfigured || !supabase) return

  try {
    const row = mapSettingsToRow(settings)
    const { error } = await supabase.from('business_settings').upsert(row)
    if (error) {
      console.error('Error saving settings to Supabase:', error.message)
    }
  } catch (err) {
    console.error('Error saving settings to cloud:', err)
  }
}
