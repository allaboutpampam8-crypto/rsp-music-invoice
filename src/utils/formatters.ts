export const formatRupiah = (amount: number): string => {
  if (amount === 0) return '0'
  const formatted = new Intl.NumberFormat('id-ID').format(amount)
  return `Rp. ${formatted}`
}

export const parseNumber = (val: string | number): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const cleaned = val.replace(/[^0-9]/g, '')
  return cleaned ? parseInt(cleaned, 10) : 0
}

const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export const formatDateIndonesian = (dateStr: string): string => {
  if (!dateStr) return ''
  // Try parsing YYYY-MM-DD
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const year = parts[0]
    const monthIdx = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    if (!isNaN(day) && monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${MONTHS_ID[monthIdx]} ${year}`
    }
  }

  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) {
    return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
  }

  return dateStr
}

export const generateInvoiceNumber = (): string => {
  const currentYear = new Date().getFullYear()
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `#RSP0${currentYear}${randomSuffix.toString().slice(0, 2)}`
}
