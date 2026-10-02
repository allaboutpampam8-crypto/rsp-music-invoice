import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { Invoice } from '../types/invoice'

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Convert all images in the node to Base64 to prevent tainted canvas in WebKit / Safari iOS
const inlineImages = async (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.querySelectorAll('img'))
  await Promise.all(
    images.map(async (img) => {
      try {
        if (!img.src || img.src.startsWith('data:')) return
        const response = await fetch(img.src)
        const blob = await response.blob()
        await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            img.src = reader.result as string
            resolve(true)
          }
          reader.onerror = () => resolve(true)
          reader.readAsDataURL(blob)
        })
      } catch (err) {
        console.warn('Gagal inline image ke base64:', img.src, err)
      }
    })
  )
}

// Generate standard filename: invoice-[client]-[day]-[month]-[year].pdf
export const generatePdfFilename = (invoice: Invoice): string => {
  const cleanClient = (invoice.clientName || 'klien')
    .trim()
    .replace(/[\s\/\\]+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
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

  // Clone node offscreen with opacity 1 so Safari/WebKit renders properly
  const clone = source.cloneNode(true) as HTMLElement
  clone.style.display = 'block'
  clone.style.visibility = 'visible'
  clone.style.opacity = '1'
  clone.style.transform = 'none'
  clone.style.boxShadow = 'none'
  clone.style.border = 'none'
  clone.style.position = 'fixed'
  clone.style.top = '0px'
  clone.style.left = '0px'
  clone.style.width = '794px'
  clone.style.minHeight = '1123px'
  clone.style.zIndex = '-9999'
  clone.style.pointerEvents = 'none'
  clone.style.backgroundColor = '#ffffff'
  clone.style.color = '#111827'
  document.body.appendChild(clone)

  try {
    // 1. Inline all images to base64 to avoid Tainted Canvas & CORS issues in iOS Safari
    await inlineImages(clone)

    // 2. Render to canvas at high resolution
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794
    })

    // 3. Convert to A4 PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST')

    const filename = generatePdfFilename(invoice)
    const pdfBlob = pdf.output('blob')
    const file = new File([pdfBlob], filename, { type: 'application/pdf' })

    // 4. On iOS Safari & Mobile: Use native share/save sheet if available
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: filename
        })
        return
      } catch (shareErr: any) {
        // If user cancelled iOS share sheet, don't trigger download
        if (shareErr.name === 'AbortError') {
          return
        }
        console.warn('Share API failed, fallback to anchor download:', shareErr)
      }
    }

    // 5. Standard Download via object URL
    const blobUrl = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link)
      }
      URL.revokeObjectURL(blobUrl)
    }, 1500)
  } catch (error: any) {
    console.error('Gagal generate PDF:', error)
    alert('Terjadi kendala saat membuat file PDF: ' + (error?.message || 'Gagal memproses dokumen.'))
  } finally {
    if (document.body.contains(clone)) {
      document.body.removeChild(clone)
    }
  }
}
