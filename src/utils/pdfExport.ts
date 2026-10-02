import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { Invoice } from '../types/invoice'

export const downloadInvoicePdf = async (invoice: Invoice): Promise<void> => {
  // Prefer the clean unscaled print-invoice-area template, fallback to visible preview
  const source = (document.querySelector('#print-invoice-area .invoice-paper') ||
    document.querySelector('.invoice-paper')) as HTMLElement
  if (!source) {
    alert('Dokumen invoice tidak ditemukan.')
    return
  }

  // Clone offscreen to eliminate any screen scale transforms
  const clone = source.cloneNode(true) as HTMLElement
  clone.style.display = 'block'
  clone.style.visibility = 'visible'
  clone.style.opacity = '1'
  clone.style.transform = 'none'
  clone.style.boxShadow = 'none'
  clone.style.border = 'none'
  clone.style.position = 'fixed'
  clone.style.top = '0px'
  clone.style.left = '-9999px'
  clone.style.width = '794px'
  clone.style.minHeight = '1123px'
  clone.style.zIndex = '-9999'
  clone.style.backgroundColor = '#ffffff'
  clone.style.color = '#111827'
  document.body.appendChild(clone)

  try {
    // Wait for all images inside clone to be loaded
    const images = Array.from(clone.querySelectorAll('img'))
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve(true)
            } else {
              img.onload = () => resolve(true)
              img.onerror = () => resolve(true)
            }
          })
      )
    )

    // Render to high-resolution canvas (scale 2.5 gives ~2000px crystal-clear quality)
    const canvas = await html2canvas(clone, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST')

    const MONTHS_ID = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    // Format client name: e.g. "Okta" -> "okta"
    const cleanClient = (invoice.clientName || 'klien')
      .trim()
      .replace(/[\s\/\\]+/g, '-')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .toLowerCase() || 'klien'

    // Format date: e.g. "2026-09-02" -> "2-September-2026"
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

    // Result example: invoice-okta-2-September-2026.pdf
    const filename = `invoice-${cleanClient}-${formattedDate}.pdf`

    pdf.save(filename)
  } catch (error) {
    console.error('Gagal generate PDF:', error)
    // Fallback to native print if canvas fails
    window.print()
  } finally {
    if (document.body.contains(clone)) {
      document.body.removeChild(clone)
    }
  }
}
