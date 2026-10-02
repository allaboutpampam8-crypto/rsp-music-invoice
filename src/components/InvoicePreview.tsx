import React from 'react'
import type { Invoice, BusinessSettings } from '../types/invoice'
import { formatRupiah, formatDateIndonesian } from '../utils/formatters'
import { RSPLogo } from './RSPLogo'

interface InvoicePreviewProps {
  invoice: Invoice
  settings: BusinessSettings
}

export const SparkleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block ${className}`}
  >
    <path d="M12 0C12 7 7 12 0 12C7 12 12 17 12 24C12 17 17 12 24 12C17 12 12 7 12 0Z" />
  </svg>
)

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, settings }) => {
  // Calculations
  const totalPricelist = invoice.items.reduce((sum, item) => sum + (item.pricelist || 0), 0)
  const totalDp = invoice.items.reduce((sum, item) => sum + (item.dp || 0), 0)
  const totalDiskon = invoice.items.reduce((sum, item) => sum + (item.diskon || 0), 0)
  const totalKekurangan = totalPricelist - totalDp - totalDiskon
  const sisa = totalKekurangan - (invoice.pelunasan || 0)

  return (
    <div
      className="invoice-paper relative bg-white text-gray-900 w-[794px] min-h-[1123px] mx-auto p-12 flex flex-col justify-between overflow-hidden shadow-xl border border-gray-200 print:shadow-none print:border-none print:p-0 print:overflow-visible select-text"
      style={{
        boxSizing: 'border-box',
        color: '#111827',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Decorative Gradient Accents from official assets */}
      {/* Top right subtle smoky/silver gradient with sparkles */}
      <img
        src="/images/2.png"
        alt=""
        className="absolute -top-16 -right-16 w-80 h-80 object-contain pointer-events-none select-none z-0 opacity-80"
      />

      {/* Bottom left subtle smoky gradient with sparkles */}
      <img
        src="/images/1.png"
        alt=""
        className="absolute -bottom-16 -left-16 w-80 h-80 object-contain pointer-events-none select-none z-0 opacity-80"
      />

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10">
        {/* Header Title with official Invoice artwork and star */}
        <div className="flex items-center gap-2 mb-10 -ml-1">
          <img
            src="/images/invoice-title.png"
            alt="Invoice"
            className="h-16 w-auto object-contain select-none"
          />
          <img
            src="/images/sparkle-single.png"
            alt=""
            className="w-5 h-5 object-contain select-none -mt-7 ml-1"
          />
        </div>

        {/* Client & Invoice Meta Info */}
        <div className="grid grid-cols-2 gap-8 mb-10 text-[13px] leading-relaxed">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 font-medium mb-0.5">Kepada :</p>
              <p className="text-gray-900 font-semibold text-[14px]">
                {invoice.clientName || '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 font-medium mb-0.5">Tanggal Acara:</p>
              <p className="text-gray-900 font-semibold text-[14px]">
                {formatDateIndonesian(invoice.eventDate) || '-'}
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 text-left pl-8">
            <div>
              <p className="text-gray-600 font-medium mb-0.5">Nomor Invoice:</p>
              <p className="text-gray-900 font-semibold text-[14px]">
                {invoice.invoiceNumber || '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 font-medium mb-0.5">Tanggal invoice:</p>
              <p className="text-gray-900 font-semibold text-[14px]">
                {formatDateIndonesian(invoice.invoiceDate) || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="w-full mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-t border-b border-gray-400 text-[12px] font-bold text-gray-800 tracking-wider">
                <th className="py-2.5 px-1 w-[6%] text-center">No</th>
                <th className="py-2.5 px-2 w-[34%]">Deskripsi</th>
                <th className="py-2.5 px-2 w-[15%] text-right">Pricelist</th>
                <th className="py-2.5 px-2 w-[15%] text-right">DP</th>
                <th className="py-2.5 px-2 w-[15%] text-right">DISKON</th>
                <th className="py-2.5 px-2 w-[15%] text-right">KEKURANGAN</th>
              </tr>
            </thead>
            <tbody className="text-[12.5px] divide-y divide-transparent">
              {invoice.items.map((item, idx) => {
                const kekurangan = (item.pricelist || 0) - (item.dp || 0) - (item.diskon || 0)
                return (
                  <tr key={item.id || idx} className="align-top">
                    <td className="py-3 px-1 text-center font-medium text-gray-700">
                      {idx + 1}.
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-semibold text-gray-900">
                        {item.descriptionTitle || '-'}
                      </div>
                      {item.details && item.details.filter((d) => d && d.trim()).length > 0 && (
                        <div className="text-gray-600 text-[11.5px] mt-1 space-y-0.5">
                          {item.details
                            .filter((d) => d && d.trim())
                            .map((detail, dIdx) => (
                              <div key={dIdx}>{detail}</div>
                            ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-gray-900 whitespace-nowrap">
                      {formatRupiah(item.pricelist)}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-gray-900 whitespace-nowrap">
                      {formatRupiah(item.dp)}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-gray-900 whitespace-nowrap">
                      {formatRupiah(item.diskon)}
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-gray-900 whitespace-nowrap">
                      {formatRupiah(kekurangan)}
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {/* Summary & Totals */}
            <tfoot>
              {/* Top border for total */}
              <tr className="border-t border-gray-400 font-bold text-[12.5px] text-gray-900">
                <td className="py-2.5 px-1"></td>
                <td className="py-2.5 px-2 text-center tracking-widest font-bold">TOTAL</td>
                <td className="py-2.5 px-2 text-right whitespace-nowrap">{formatRupiah(totalPricelist)}</td>
                <td className="py-2.5 px-2 text-right whitespace-nowrap">{formatRupiah(totalDp)}</td>
                <td className="py-2.5 px-2 text-right whitespace-nowrap">{formatRupiah(totalDiskon)}</td>
                <td className="py-2.5 px-2 text-right whitespace-nowrap">{formatRupiah(totalKekurangan)}</td>
              </tr>

              {/* Pelunasan Row */}
              <tr className="text-[12.5px] font-semibold text-gray-800">
                <td className="py-1 px-1"></td>
                <td className="py-1 px-2 text-center tracking-wider text-gray-700">PELUNASAN</td>
                <td className="py-1 px-2"></td>
                <td className="py-1 px-2"></td>
                <td className="py-1 px-2"></td>
                <td className="py-1 px-2 text-right whitespace-nowrap font-medium text-gray-900">
                  {invoice.pelunasan > 0 ? formatRupiah(invoice.pelunasan) : '0'}
                </td>
              </tr>

              {/* Sisa Row */}
              <tr className="text-[12.5px] font-bold text-gray-900">
                <td className="py-1 px-1"></td>
                <td className="py-1 px-2 text-center tracking-wider text-gray-800">SISA</td>
                <td className="py-1 px-2"></td>
                <td className="py-1 px-2"></td>
                <td className="py-1 px-2"></td>
                <td className="py-1 px-2 text-right whitespace-nowrap text-gray-900 font-bold">
                  {formatRupiah(sisa)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <div className="relative z-10 pt-4">
        {/* Divider line before footer */}
        <div className="w-full border-t border-gray-400 mb-8" />

        <div className="grid grid-cols-2 gap-8 text-[12px] leading-relaxed">
          {/* Left Footer: Brand & Contacts */}
          <div className="space-y-4">
            <h3 className="font-bold text-[13px] tracking-wider text-gray-900 uppercase">
              {settings.businessName}
            </h3>

            {/* Logo Badge */}
            <div className="flex justify-start my-2">
              <RSPLogo logoUrl={settings.logoUrl} />
            </div>

            <div className="space-y-1 text-gray-800 font-medium text-[11.5px]">
              <p>
                <span className="text-gray-600">Instagram : </span>
                {settings.instagram}
              </p>
              <p>
                <span className="text-gray-600">email : </span>
                {settings.email}
              </p>
              <p>
                <span className="text-gray-600">WA : </span>
                {settings.whatsapp}
              </p>
            </div>
          </div>

          {/* Right Footer: Payment & Notes */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-[13px] tracking-wider text-gray-900 uppercase mb-2">
                INFORMASI PEMBAYARAN
              </h3>
              <div className="space-y-1 text-gray-800 text-[12px]">
                <div className="flex">
                  <span className="w-24 text-gray-600">Bank</span>
                  <span className="font-semibold">: {settings.bankName}</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-600">Atas Nama</span>
                  <span className="font-semibold">: {settings.accountName}</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-600">No. Rekening</span>
                  <span className="font-semibold">: {settings.accountNumber}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="font-bold text-[11.5px] tracking-wider text-gray-900 uppercase mb-1">
                NOTE
              </h4>
              <ul className="text-gray-700 italic text-[11px] space-y-0.5">
                <li>{settings.note1}</li>
                <li>{settings.note2}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
