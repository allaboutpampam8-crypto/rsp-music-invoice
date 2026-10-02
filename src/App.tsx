import { useState, useEffect } from 'react'
import type { Invoice, BusinessSettings } from './types/invoice'
import {
  getStoredInvoices,
  getStoredSettings,
  createNewEmptyInvoice
} from './utils/storage'
import {
  fetchCloudInvoices,
  saveCloudInvoice,
  deleteCloudInvoice,
  fetchCloudSettings,
  saveCloudSettings
} from './utils/database'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { InvoiceForm } from './components/InvoiceForm'
import { InvoicePreview } from './components/InvoicePreview'
import { ResponsivePreview } from './components/ResponsivePreview'
import { InvoiceRecap } from './components/InvoiceRecap'
import { SettingsModal } from './components/SettingsModal'
import {
  FileText,
  BarChart3,
  Settings,
  Printer,
  PlusCircle,
  Eye,
  Edit3,
  Columns,
  Cloud,
  HardDrive
} from 'lucide-react'

export function App() {
  const [invoices, setInvoices] = useState<Invoice[]>(getStoredInvoices)
  const [settings, setSettings] = useState<BusinessSettings>(getStoredSettings)
  const [activeTab, setActiveTab] = useState<'editor' | 'recap'>('editor')
  const [viewMode, setViewMode] = useState<'split' | 'formOnly' | 'previewOnly'>('split')
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Default clean empty invoice ready to fill
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(createNewEmptyInvoice)

  // Fetch from cloud on initial load
  useEffect(() => {
    const loadCloudData = async () => {
      const cloudInvs = await fetchCloudInvoices()
      if (cloudInvs && cloudInvs.length > 0) {
        setInvoices(cloudInvs)
      }
      const cloudSet = await fetchCloudSettings()
      if (cloudSet) {
        setSettings(cloudSet)
      }
    }
    loadCloudData()

    // Realtime subscription if Supabase is connected
    if (isSupabaseConfigured && supabase) {
      const client = supabase
      const channel = client
        .channel('invoices-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'invoices' },
          async () => {
            const updated = await fetchCloudInvoices()
            setInvoices(updated)
          }
        )
        .subscribe()

      return () => {
        client.removeChannel(channel)
      }
    }
  }, [])

  // Save current invoice into the recap list & cloud
  const handleSaveCurrentInvoice = async () => {
    const existingIndex = invoices.findIndex((inv) => inv.id === currentInvoice.id)
    let updatedList: Invoice[]

    const now = new Date().toISOString()
    const invoiceToSave: Invoice = {
      ...currentInvoice,
      updatedAt: now
    }

    if (existingIndex >= 0) {
      updatedList = [...invoices]
      updatedList[existingIndex] = invoiceToSave
    } else {
      updatedList = [invoiceToSave, ...invoices]
    }

    setInvoices(updatedList)
    await saveCloudInvoice(invoiceToSave)

    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  // Create clean new invoice
  const handleNewInvoice = () => {
    setCurrentInvoice(createNewEmptyInvoice())
    setActiveTab('editor')
    setMobileTab('form')
    setViewMode('split')
  }

  // Edit an invoice selected from recap
  const handleSelectFromRecap = (invoice: Invoice) => {
    setCurrentInvoice(invoice)
    setActiveTab('editor')
    setMobileTab('form')
  }

  // Delete invoice
  const handleDeleteInvoice = async (id: string) => {
    const remaining = invoices.filter((inv) => inv.id !== id)
    setInvoices(remaining)
    await deleteCloudInvoice(id)

    if (currentInvoice.id === id) {
      if (remaining.length > 0) {
        setCurrentInvoice(remaining[0])
      } else {
        handleNewInvoice()
      }
    }
  }

  // Save settings handler
  const handleSaveSettings = async (newSettings: BusinessSettings) => {
    setSettings(newSettings)
    await saveCloudSettings(newSettings)
  }

  // Print action
  const handlePrint = (targetInvoice?: Invoice) => {
    if (targetInvoice) {
      setCurrentInvoice(targetInvoice)
    }
    setTimeout(() => {
      window.print()
    }, 150)
  }

  return (
    <>
      {/* 1. SCREEN VIEW (Visible on web & tablet, hidden during print) */}
      <div id="screen-app" className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans pb-20 sm:pb-8">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-16 flex items-center justify-between gap-2">
            {/* Brand Info with Official RSP Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shadow-2xs overflow-hidden shrink-0">
                <img
                  src="/images/logo-rsp.png"
                  alt="RSP Music Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <div className="font-black text-sm sm:text-base tracking-tight text-slate-900 leading-tight">
                  RSP MUSIC
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-wide">
                  Invoice & Billing
                </div>
              </div>
            </div>

            {/* Cloud Sync Status Indicator */}
            <div className="hidden lg:flex items-center">
              {isSupabaseConfigured ? (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-semibold"
                  title="Tersambung ke Supabase. Data tersinkronisasi otomatis antar semua perangkat!"
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cloud Sync Aktif</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium"
                  title="Data tersimpan di browser ini. Hubungkan Supabase untuk sinkron multi-perangkat."
                >
                  <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mode Penyimpanan Lokal</span>
                </div>
              )}
            </div>

            {/* Navigation Tabs (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'editor'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Editor & Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('recap')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'recap'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Rekap Data</span>
                {invoices.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full text-[10px]">
                    {invoices.length}
                  </span>
                )}
              </button>
            </div>

            {/* Right Utilities */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleNewInvoice}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Buat Baru</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
                title="Pengaturan Bisnis & Rekening"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => handlePrint()}
                className="px-3.5 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-black active:scale-95 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Cetak / PDF</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8">
          {activeTab === 'editor' ? (
            <div>
              {/* MOBILE ONLY VIEW TOGGLE (< sm) */}
              <div className="sm:hidden flex mb-4 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMobileTab('form')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    mobileTab === 'form'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-4 h-4" /> Form Input
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab('preview')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    mobileTab === 'preview'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-4 h-4" /> Preview Invoice
                </button>
              </div>

              {/* DESKTOP / TABLET VIEW SWITCHER (>= sm) */}
              <div className="hidden sm:flex items-center justify-between mb-5 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                      viewMode === 'split'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Split (Form & Preview)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('formOnly')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                      viewMode === 'formOnly'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Hanya Form</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('previewOnly')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                      viewMode === 'previewOnly'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Hanya Preview A4</span>
                  </button>
                </div>

                <div className="text-xs text-slate-500">
                  No: <span className="font-mono font-bold text-slate-800">{currentInvoice.invoiceNumber}</span>
                </div>
              </div>

              {/* Responsive Layout Grid */}
              <div
                className={`grid gap-6 sm:gap-8 items-start ${
                  viewMode === 'split'
                    ? 'grid-cols-1 lg:grid-cols-12'
                    : 'grid-cols-1'
                }`}
              >
                {/* Form Column */}
                <div
                  className={`w-full ${
                    viewMode === 'split'
                      ? 'lg:col-span-6'
                      : 'max-w-3xl mx-auto'
                  } ${mobileTab === 'preview' ? 'hidden sm:block' : 'block'}`}
                >
                  <InvoiceForm
                    invoice={currentInvoice}
                    onChange={(updated) => setCurrentInvoice(updated)}
                    onSave={handleSaveCurrentInvoice}
                    onPrint={() => handlePrint()}
                    onNew={handleNewInvoice}
                    isSaved={isSaved}
                  />
                </div>

                {/* Preview Column */}
                <div
                  className={`w-full flex flex-col items-center ${
                    viewMode === 'split'
                      ? 'lg:col-span-6'
                      : 'max-w-4xl mx-auto'
                  } ${mobileTab === 'form' ? 'hidden sm:flex' : 'flex'}`}
                >
                  <ResponsivePreview
                    invoice={currentInvoice}
                    settings={settings}
                    onPrint={() => handlePrint()}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Recap Data Tab */
            <div>
              <InvoiceRecap
                invoices={invoices}
                onSelectInvoice={handleSelectFromRecap}
                onDeleteInvoice={handleDeleteInvoice}
                onPrintInvoice={(inv) => handlePrint(inv)}
              />
            </div>
          )}
        </main>

        {/* MOBILE BOTTOM NAVIGATION BAR (Sticky at bottom on phones) */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
          <button
            type="button"
            onClick={() => {
              setActiveTab('editor')
              setMobileTab('form')
            }}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'editor' && mobileTab === 'form'
                ? 'text-indigo-600 font-bold'
                : 'text-slate-500 font-medium'
            }`}
          >
            <Edit3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Form</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('editor')
              setMobileTab('preview')
            }}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'editor' && mobileTab === 'preview'
                ? 'text-indigo-600 font-bold'
                : 'text-slate-500 font-medium'
            }`}
          >
            <Eye className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Invoice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recap')}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all relative ${
              activeTab === 'recap'
                ? 'text-indigo-600 font-bold'
                : 'text-slate-500 font-medium'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Rekap</span>
            {invoices.length > 0 && (
              <span className="absolute top-0.5 right-2 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                {invoices.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleNewInvoice}
            className="flex flex-col items-center py-1 px-3 rounded-xl text-slate-700 active:scale-95"
          >
            <PlusCircle className="w-5 h-5 mb-0.5 text-slate-800" />
            <span className="text-[10px] font-semibold">Baru</span>
          </button>
        </div>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSave={handleSaveSettings}
        />
      </div>

      {/* 2. DEDICATED PRINT AREA (Only visible to printer / browser Print to PDF) */}
      <div id="print-invoice-area">
        <InvoicePreview invoice={currentInvoice} settings={settings} />
      </div>
    </>
  )
}

export default App
