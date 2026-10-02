import React, { useState } from 'react'
import type { Invoice } from '../types/invoice'
import { formatRupiah, formatDateIndonesian } from '../utils/formatters'
import {
  Search,
  Edit,
  Trash2,
  MessageSquare,
  Download,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Share2
} from 'lucide-react'

interface InvoiceRecapProps {
  invoices: Invoice[]
  onSelectInvoice: (invoice: Invoice) => void
  onDeleteInvoice: (id: string) => void
  onPrintInvoice: (invoice: Invoice) => void
}

export const InvoiceRecap: React.FC<InvoiceRecapProps> = ({
  invoices,
  onSelectInvoice,
  onDeleteInvoice,
  onPrintInvoice
}) => {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'LUNAS' | 'DP' | 'PENDING'>('ALL')

  // Filtered invoices
  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Summary statistics
  const stats = invoices.reduce(
    (acc, inv) => {
      const pricelist = inv.items.reduce((s, i) => s + (i.pricelist || 0), 0)
      const dp = inv.items.reduce((s, i) => s + (i.dp || 0), 0)
      const diskon = inv.items.reduce((s, i) => s + (i.diskon || 0), 0)
      const kekurangan = pricelist - dp - diskon
      const sisa = kekurangan - (inv.pelunasan || 0)

      acc.totalPricelist += pricelist
      acc.totalDp += dp
      acc.totalDiskon += diskon
      acc.totalSisa += sisa
      if (inv.status === 'LUNAS') acc.totalLunas += 1
      return acc
    },
    { totalPricelist: 0, totalDp: 0, totalDiskon: 0, totalSisa: 0, totalLunas: 0 }
  )

  const handleCopyWhatsAppText = (inv: Invoice) => {
    const totalPricelist = inv.items.reduce((sum, item) => sum + (item.pricelist || 0), 0)
    const totalDp = inv.items.reduce((sum, item) => sum + (item.dp || 0), 0)
    const totalDiskon = inv.items.reduce((sum, item) => sum + (item.diskon || 0), 0)
    const sisa = totalPricelist - totalDp - totalDiskon - (inv.pelunasan || 0)

    const text = `Halo Kak ${inv.clientName || ''},\nBerikut rincian invoice dari *RSP Music Entertainment*:\n\n📄 No: ${inv.invoiceNumber}\n📅 Tgl Acara: ${formatDateIndonesian(inv.eventDate)}\n💰 Total Paket: ${formatRupiah(totalPricelist)}\n💵 DP Masuk: ${formatRupiah(totalDp)}\n🔴 Sisa Pembayaran: *${formatRupiah(sisa)}*\n\nTerima kasih banyak atas kerjasamanya! 🙏✨`
    navigator.clipboard.writeText(text)
    alert('Pesan tagihan WhatsApp berhasil disalin ke clipboard!')
  }

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(invoices, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rekap-invoice-rsp-music-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* KPI Stats Cards (Mobile 2x2 Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold">Total Invoice</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{invoices.length}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
            {stats.totalLunas} sudah lunas
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold">Total Nilai Paket</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 truncate">
            {formatRupiah(stats.totalPricelist)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Total kesepakatan</div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold">DP Masuk</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-600 truncate">
            {formatRupiah(stats.totalDp)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Dana DP diterima</div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold">Sisa Piutang</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-rose-600 truncate">
            {formatRupiah(stats.totalSisa)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Belum dilunasi</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama klien, lokasi, nomor..."
            className="w-full pl-10 pr-4 py-2.5 text-base sm:text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Status Filter Pills (Horizontal scrollable on phone) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'LUNAS', 'DP', 'PENDING'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 sm:py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all active:scale-95 ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL'
                ? 'Semua'
                : st === 'LUNAS'
                ? 'Lunas'
                : st === 'DP'
                ? 'DP Masuk'
                : 'Pending'}
            </button>
          ))}
        </div>

        {/* Export JSON button */}
        {invoices.length > 0 && (
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl flex items-center justify-center gap-1.5 transition-colors self-end sm:self-auto"
            title="Download Backup Data JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup Data</span>
          </button>
        )}
      </div>

      {/* RECAP LIST: Mobile Card View (Optimized for Phones) */}
      <div className="lg:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-slate-400 border border-slate-200">
            {invoices.length === 0
              ? 'Belum ada data invoice yang tersimpan. Buat invoice baru pada menu Editor.'
              : 'Tidak ada invoice yang sesuai pencarian.'}
          </div>
        ) : (
          filtered.map((inv) => {
            const pricelist = inv.items.reduce((s, i) => s + (i.pricelist || 0), 0)
            const dp = inv.items.reduce((s, i) => s + (i.dp || 0), 0)
            const diskon = inv.items.reduce((s, i) => s + (i.diskon || 0), 0)
            const sisa = pricelist - dp - diskon - (inv.pelunasan || 0)

            return (
              <div
                key={inv.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3"
              >
                {/* Header Card: Client & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {inv.clientName || '(Tanpa Nama)'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDateIndonesian(inv.eventDate)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold shrink-0 ${
                      inv.status === 'LUNAS'
                        ? 'bg-emerald-100 text-emerald-700'
                        : inv.status === 'DP'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {inv.status === 'LUNAS'
                      ? 'Lunas'
                      : inv.status === 'DP'
                      ? 'DP Masuk'
                      : 'Pending'}
                  </span>
                </div>

                {/* Financial Details Row */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Paket</div>
                    <div className="font-semibold text-slate-800 mt-0.5 truncate">
                      {formatRupiah(pricelist)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">DP Masuk</div>
                    <div className="font-semibold text-emerald-600 mt-0.5 truncate">
                      {formatRupiah(dp)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Sisa Tagihan</div>
                    <div className="font-bold text-rose-600 mt-0.5 truncate">
                      {formatRupiah(sisa)}
                    </div>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onSelectInvoice(inv)}
                    className="py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPrintInvoice(inv)}
                    className="py-2 bg-slate-900 hover:bg-black active:scale-95 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                    title="Unduh Dokumen PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyWhatsAppText(inv)}
                    className="py-2 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus invoice ${inv.invoiceNumber}?`)) {
                        onDeleteInvoice(inv.id)
                      }
                    }}
                    className="py-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* RECAP TABLE: Desktop View (Large Screens) */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice</th>
                <th className="py-3 px-4">Klien / Lokasi</th>
                <th className="py-3 px-4">Tgl Acara</th>
                <th className="py-3 px-4 text-right">Pricelist</th>
                <th className="py-3 px-4 text-right">DP</th>
                <th className="py-3 px-4 text-right">Sisa Tagihan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {invoices.length === 0
                      ? 'Belum ada data invoice yang tersimpan. Buat invoice baru pada menu Editor.'
                      : 'Tidak ada invoice yang sesuai pencarian.'}
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const pricelist = inv.items.reduce((s, i) => s + (i.pricelist || 0), 0)
                  const dp = inv.items.reduce((s, i) => s + (i.dp || 0), 0)
                  const diskon = inv.items.reduce((s, i) => s + (i.diskon || 0), 0)
                  const sisa = pricelist - dp - diskon - (inv.pelunasan || 0)

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium">{inv.clientName || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatDateIndonesian(inv.eventDate)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium whitespace-nowrap">
                        {formatRupiah(pricelist)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-600 font-medium whitespace-nowrap">
                        {formatRupiah(dp)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(sisa)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            inv.status === 'LUNAS'
                              ? 'bg-emerald-100 text-emerald-700'
                              : inv.status === 'DP'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {inv.status === 'LUNAS'
                            ? 'Lunas'
                            : inv.status === 'DP'
                            ? 'DP Masuk'
                            : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectInvoice(inv)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit / Buka Form"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onPrintInvoice(inv)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Unduh Dokumen PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyWhatsAppText(inv)}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Salin Teks WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus invoice ${inv.invoiceNumber}?`)) {
                                onDeleteInvoice(inv.id)
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
