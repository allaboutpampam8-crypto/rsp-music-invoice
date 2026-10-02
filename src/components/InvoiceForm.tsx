import React, { useState } from 'react'
import type { Invoice, InvoiceItem } from '../types/invoice'
import { generateInvoiceNumber, parseNumber } from '../utils/formatters'
import { Plus, Trash2, RefreshCw, Sparkles, CheckCircle2, ChevronDown, ChevronUp, Printer } from 'lucide-react'

interface InvoiceFormProps {
  invoice: Invoice
  onChange: (updated: Invoice) => void
  onSave: () => void
  onPrint: () => void
  onNew: () => void
  isSaved?: boolean
}

// Preset packages common for music entertainment
const PRESET_PACKAGES = [
  {
    title: 'Paket Bronze',
    details: ['2 Penyanyi', '1 Keyboard', '1 Saxo', '1 Sound + Genset'],
    price: 3499000,
    dp: 300000,
    diskon: 174000
  },
  {
    title: 'Paket Silver',
    details: ['2 Penyanyi', '1 Keyboard', '1 Saxo', '1 Gitar Akustik', '1 Sound + Genset'],
    price: 4500000,
    dp: 500000,
    diskon: 200000
  },
  {
    title: 'Paket Gold / Full Band',
    details: ['2 Penyanyi', '1 Keyboard', '1 Saxo', '1 Gitar', '1 Bass', '1 Drum', 'Sound System Pro'],
    price: 6500000,
    dp: 1000000,
    diskon: 250000
  },
  {
    title: 'Paket Akustik Minimalis',
    details: ['1 Penyanyi', '1 Gitar Akustik / Keyboard', 'Sound Standard'],
    price: 2000000,
    dp: 300000,
    diskon: 0
  }
]

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  onChange,
  onSave,
  onPrint,
  onNew,
  isSaved
}) => {
  const [showPresets, setShowPresets] = useState(false)

  // Handlers for general fields
  const handleFieldChange = (field: keyof Invoice, value: any) => {
    onChange({
      ...invoice,
      [field]: value
    })
  }

  // Generate new invoice number
  const handleRegenerateNumber = () => {
    handleFieldChange('invoiceNumber', generateInvoiceNumber())
  }

  // Item list handlers
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: 'item-' + Date.now(),
      descriptionTitle: '',
      details: [],
      pricelist: 0,
      dp: 0,
      diskon: 0
    }
    onChange({
      ...invoice,
      items: [...invoice.items, newItem]
    })
  }

  const handleApplyPreset = (preset: typeof PRESET_PACKAGES[0]) => {
    // If the only item is completely blank, replace it instead of appending
    let newItems: InvoiceItem[]
    if (
      invoice.items.length === 1 &&
      !invoice.items[0].descriptionTitle &&
      invoice.items[0].pricelist === 0
    ) {
      newItems = [
        {
          id: invoice.items[0].id || 'item-' + Date.now(),
          descriptionTitle: preset.title,
          details: [...preset.details],
          pricelist: preset.price,
          dp: preset.dp,
          diskon: preset.diskon
        }
      ]
    } else {
      newItems = [
        ...invoice.items,
        {
          id: 'item-' + Date.now(),
          descriptionTitle: preset.title,
          details: [...preset.details],
          pricelist: preset.price,
          dp: preset.dp,
          diskon: preset.diskon
        }
      ]
    }

    onChange({
      ...invoice,
      items: newItems
    })
    setShowPresets(false)
  }

  const handleUpdateItem = (index: number, updatedItem: Partial<InvoiceItem>) => {
    const newItems = [...invoice.items]
    newItems[index] = { ...newItems[index], ...updatedItem }
    onChange({
      ...invoice,
      items: newItems
    })
  }

  const handleRemoveItem = (index: number) => {
    if (invoice.items.length <= 1) {
      // Clear instead of deleting last item
      handleUpdateItem(0, {
        descriptionTitle: '',
        details: [],
        pricelist: 0,
        dp: 0,
        diskon: 0
      })
      return
    }
    const newItems = invoice.items.filter((_, i) => i !== index)
    onChange({
      ...invoice,
      items: newItems
    })
  }

  const handleDetailsTextChange = (index: number, text: string) => {
    const lines = text.split('\n')
    handleUpdateItem(index, { details: lines })
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-6 lg:p-7 space-y-6">
      {/* Top Header Actions (Mobile & Desktop Responsive, No Offside) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="min-w-0 pr-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
            Formulir Invoice
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lengkapi data di bawah untuk membuat invoice
          </p>
        </div>

        {/* Action Buttons - Uniform Height & Pixel-perfect Alignment */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onNew}
            className="h-9 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all flex items-center justify-center gap-1.5"
            title="Reset Form Invoice Baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Baru</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            className={`h-9 px-3.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 ${
              isSaved
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            title="Simpan ke Rekap Data"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Tersimpan!' : 'Simpan'}</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="h-9 px-3.5 text-xs font-bold bg-slate-900 text-white hover:bg-black active:scale-95 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5"
            title="Cetak atau Unduh PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Basic Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Client Name & Location */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Kepada (Nama Klien & Lokasi Acara)
          </label>
          <input
            type="text"
            value={invoice.clientName}
            onChange={(e) => handleFieldChange('clientName', e.target.value)}
            placeholder="Contoh: Nisa - Bantarbolang"
            className="w-full text-base sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Invoice Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Nomor Invoice</span>
            <button
              type="button"
              onClick={handleRegenerateNumber}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 py-0.5 px-1.5 rounded hover:bg-indigo-50"
            >
              <RefreshCw className="w-3 h-3" /> Acak
            </button>
          </label>
          <input
            type="text"
            value={invoice.invoiceNumber}
            onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
            placeholder="#RSP0202639"
            className="w-full text-base sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono font-medium"
          />
        </div>

        {/* Event Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tanggal Acara
          </label>
          <input
            type="date"
            value={invoice.eventDate}
            onChange={(e) => handleFieldChange('eventDate', e.target.value)}
            className="w-full text-base sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
          />
        </div>

        {/* Invoice Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tanggal Invoice
          </label>
          <input
            type="date"
            value={invoice.invoiceDate}
            onChange={(e) => handleFieldChange('invoiceDate', e.target.value)}
            className="w-full text-base sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
          />
        </div>
      </div>

      {/* Package Items Section */}
      <div className="pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Daftar Paket & Layanan
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="text-xs text-indigo-700 font-semibold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 active:scale-95 px-3 py-1.5 rounded-lg transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Template Paket</span>
              {showPresets ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Dropdown / Chips (Touch-friendly) */}
        {showPresets && (
          <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-1">
            <p className="text-xs font-bold text-indigo-950 mb-2">
              Pilih Paket Siap Pakai (1-Klik Isi):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRESET_PACKAGES.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="text-left p-3 bg-white hover:bg-indigo-50/70 active:scale-98 rounded-xl border border-indigo-200/70 shadow-2xs transition-all"
                >
                  <div className="text-xs font-bold text-slate-900">{preset.title}</div>
                  <div className="text-[12px] text-indigo-600 font-bold mt-0.5">
                    Rp {preset.price.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10.5px] text-slate-500 line-clamp-2 mt-1">
                    {preset.details.join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Item Cards */}
        <div className="space-y-4">
          {invoice.items.map((item, index) => {
            const kekurangan = (item.pricelist || 0) - (item.dp || 0) - (item.diskon || 0)
            return (
              <div
                key={item.id || index}
                className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 relative group"
              >
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="absolute top-3.5 right-3.5 text-slate-400 hover:text-red-500 active:scale-90 p-1.5 rounded-lg transition-colors"
                  title="Hapus Baris"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold">
                    {index + 1}
                  </span>
                  <span>Rincian Paket</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  {/* Title & Details */}
                  <div className="md:col-span-6 space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Judul Paket / Layanan
                      </label>
                      <input
                        type="text"
                        value={item.descriptionTitle}
                        onChange={(e) =>
                          handleUpdateItem(index, { descriptionTitle: e.target.value })
                        }
                        placeholder="Contoh: Paket Bronze"
                        className="w-full text-base sm:text-xs px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Rincian Item (1 baris per item)
                      </label>
                      <textarea
                        rows={3}
                        value={(item.details || []).join('\n')}
                        onChange={(e) => handleDetailsTextChange(index, e.target.value)}
                        placeholder="2 Penyanyi&#10;1 Keyboard&#10;1 Saxo&#10;1 Sound + Genset"
                        className="w-full text-sm sm:text-xs px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-sans leading-relaxed placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Financial inputs for this row */}
                  <div className="md:col-span-6 grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Pricelist (Rp)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={item.pricelist ? item.pricelist.toLocaleString('id-ID') : ''}
                        onChange={(e) =>
                          handleUpdateItem(index, { pricelist: parseNumber(e.target.value) })
                        }
                        placeholder="0"
                        className="w-full text-base sm:text-xs px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-right font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        DP (Uang Muka)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={item.dp ? item.dp.toLocaleString('id-ID') : ''}
                        onChange={(e) =>
                          handleUpdateItem(index, { dp: parseNumber(e.target.value) })
                        }
                        placeholder="0"
                        className="w-full text-base sm:text-xs px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-right font-semibold text-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Diskon (Rp)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={item.diskon ? item.diskon.toLocaleString('id-ID') : ''}
                        onChange={(e) =>
                          handleUpdateItem(index, { diskon: parseNumber(e.target.value) })
                        }
                        placeholder="0"
                        className="w-full text-base sm:text-xs px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-right font-semibold text-rose-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Kekurangan (Otomatis)
                      </label>
                      <div className="w-full text-base sm:text-xs px-3 py-2.5 bg-slate-200/60 rounded-xl border border-slate-200 text-right font-bold text-slate-900 flex items-center justify-end">
                        Rp {kekurangan.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pelunasan & Status Section */}
      <div className="pt-2 border-t border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pelunasan Tambahan (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={invoice.pelunasan ? invoice.pelunasan.toLocaleString('id-ID') : ''}
              onChange={(e) =>
                handleFieldChange('pelunasan', parseNumber(e.target.value))
              }
              placeholder="0 (Jika ada pelunasan lanjutan)"
              className="w-full text-base sm:text-sm px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Diisi jika klien telah menyetor dana pelunasan
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Status Tagihan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['PENDING', 'DP', 'LUNAS'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleFieldChange('status', st)}
                  className={`py-3 sm:py-2.5 text-xs font-bold rounded-xl border transition-all active:scale-95 ${
                    invoice.status === st
                      ? st === 'LUNAS'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : st === 'DP'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st === 'PENDING' ? 'Pending' : st === 'DP' ? 'DP Masuk' : 'Lunas'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
