import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import type { Invoice } from '../types/invoice'

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Generate standard filename: invoice-[client]-[day]-[month]-[year].pdf
export const generatePdfFilename = (invoice: Invoice): string => {
  const cleanClient = (invoice.clientName || 'klien')
    .trim()
    .replace(/[\s,/\\_+-]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'klien'

  let formattedDate = ''
  if (invoice.eventDate) {
    const parts = invoice.eventDate.split('-')
    if (parts.length === 3) {
      const year = parts[0]
      const monthIdx = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      if (!isNaN(day) && monthIdx >= 0 && monthIdx < 12) {
        formattedDate = `${day}-${MONTHS_ID[monthIdx]}-${year}`
      }
    }
    if (!formattedDate) {
      const d = new Date(invoice.eventDate)
      if (!isNaN(d.getTime())) {
        formattedDate = `${d.getDate()}-${MONTHS_ID[d.getMonth()]}-${d.getFullYear()}`
      }
    }
  }

  if (!formattedDate) {
    const now = new Date()
    formattedDate = `${now.getDate()}-${MONTHS_ID[now.getMonth()]}-${now.getFullYear()}`
  }

  return `invoice-${cleanClient}-${formattedDate}.pdf`
}

export const downloadInvoicePdf = async (invoice: Invoice): Promise<void> => {
  // Prefer the clean unscaled print-invoice-area template, fallback to visible preview
  const source = (document.querySelector('#print-invoice-area .invoice-paper') ||
    document.querySelector('.invoice-paper')) as HTMLElement

  if (!source) {
    alert('Dokumen invoice tidak ditemukan.')
    return
  }

  // Clone node offscreen with exact A4 dimensions and coordinates (0,0)
  const clone = source.cloneNode(true) as HTMLElement
  clone.style.position = 'fixed'
  clone.style.top = '0px'
  clone.style.left = '0px'
  clone.style.width = '794px'
  clone.style.height = '1123px'
  clone.style.minHeight = '1123px'
  clone.style.maxHeight = '1123px'
  clone.style.margin = '0px'
  clone.style.boxSizing = 'border-box'
  clone.style.transform = 'none'
  clone.style.transformOrigin = 'top left'
  clone.style.overflow = 'hidden'
  clone.style.boxShadow = 'none'
  clone.style.border = 'none'
  clone.style.zIndex = '-999999'
  clone.style.pointerEvents = 'none'
  clone.style.opacity = '1'
  clone.style.visibility = 'visible'
  clone.style.backgroundColor = '#ffffff'
  clone.style.color = '#111827'
  document.body.appendChild(clone)

  try {
    // Wait for all images inside clone to be fully loaded
    const images = Array.from(clone.querySelectorAll('img'))
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve(true)
            } else {
              img.onload = () => resolve(true)
              img.onerror = () => resolve(true)
            }
          })
      )
    )

    // Render to high-resolution canvas with html2canvas-pro with locked A4 window dimensions
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST')

    const filename = generatePdfFilename(invoice)

    // Direct save PDF file
    pdf.save(filename)
  } catch (error: any) {
    console.error('Gagal generate PDF:', error)
    alert('Terjadi kendala saat membuat file PDF: ' + (error?.message || 'Gagal memproses dokumen.'))
  } finally {
    if (document.body.contains(clone)) {
      document.body.removeChild(clone)
    }
  }
}
