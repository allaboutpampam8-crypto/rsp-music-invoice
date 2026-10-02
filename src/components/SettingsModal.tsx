import React, { useState } from 'react'
import type { BusinessSettings } from '../types/invoice'
import { X, Upload, RotateCcw, Check } from 'lucide-react'
import { defaultSettings } from '../utils/storage'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: BusinessSettings
  onSave: (settings: BusinessSettings) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [form, setForm] = useState<BusinessSettings>(settings)

  if (!isOpen) return null

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, logoUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReset = () => {
    if (confirm('Kembalikan ke pengaturan awal template RSP Music?')) {
      setForm(defaultSettings)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Pengaturan Bisnis & Rekening
            </h3>
            <p className="text-xs text-slate-500">
              Ubah data rekening, kontak, dan logo di invoice
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs">
          {/* Logo Upload */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Logo Bisnis (Opsional Gambar PNG / JPG)
            </label>
            <div className="flex items-center gap-3">
              {form.logoUrl ? (
                <div className="relative border p-1 rounded-lg bg-slate-50">
                  <img
                    src={form.logoUrl}
                    alt="Logo"
                    className="h-12 w-20 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, logoUrl: undefined }))}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="text-slate-400 text-xs italic">
                  (Menggunakan badge bawaan RSP MUSIC 𝄞)
                </div>
              )}
              <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                Upload Logo Baru
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Brand / Usaha
            </label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Bank
              </label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                No. Rekening
              </label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Atas Nama Rekening
              </label>
              <input
                type="text"
                value={form.accountName}
                onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 pt-2 border-t">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Instagram
              </label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="text"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 pt-2 border-t">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan 1
              </label>
              <input
                type="text"
                value={form.note1}
                onChange={(e) => setForm({ ...form, note1: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan 2
              </label>
              <input
                type="text"
                value={form.note2}
                onChange={(e) => setForm({ ...form, note2: e.target.value })}
                className="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Default
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Simpan Pengaturan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
