import React, { useState, useRef, useEffect } from 'react'
import type { Invoice, BusinessSettings } from '../types/invoice'
import { InvoicePreview } from './InvoicePreview'
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Eye, Printer } from 'lucide-react'

interface ResponsivePreviewProps {
  invoice: Invoice
  settings: BusinessSettings
  onPrint: () => void
}

export const ResponsivePreview: React.FC<ResponsivePreviewProps> = ({
  invoice,
  settings,
  onPrint
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(600)
  const [zoomMode, setZoomMode] = useState<'fit' | number>('fit')
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // Measure container width responsively
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const updateWidth = () => {
      if (el) {
        setContainerWidth(el.clientWidth)
      }
    }

    updateWidth()

    const observer = new ResizeObserver(() => {
      updateWidth()
    })
    observer.observe(el)

    window.addEventListener('resize', updateWidth)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  // A4 dimensions at 96 DPI
  const A4_WIDTH = 794
  const A4_HEIGHT = 1123

  // Calculate actual scale
  const autoScale = Math.min(1, Math.max(0.4, (containerWidth - 24) / A4_WIDTH))
  const currentScale = zoomMode === 'fit' ? autoScale : zoomMode

  // Zoom controls
  const handleZoomIn = () => {
    setZoomMode((prev) => {
      const cur = prev === 'fit' ? autoScale : prev
      return Math.min(1.2, +(cur + 0.1).toFixed(2))
    })
  }

  const handleZoomOut = () => {
    setZoomMode((prev) => {
      const cur = prev === 'fit' ? autoScale : prev
      return Math.max(0.4, +(cur - 0.1).toFixed(2))
    })
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Preview Header Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-3 px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-600" />
            Live Preview (Format A4)
          </span>
          <span className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold">
            {Math.round(currentScale * 100)}%
          </span>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="Perkecil (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomMode('fit')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                zoomMode === 'fit'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Pas Lebar Layar (Fit)"
            >
              Fit
            </button>
            <button
              type="button"
              onClick={() => setZoomMode(1)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                zoomMode === 1
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Ukuran Asli 100%"
            >
              100%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="Perbesar (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg shadow-2xs transition-colors"
            title="Layar Penuh"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all text-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container with dynamic scale */}
      <div
        ref={containerRef}
        className="w-full flex justify-center overflow-x-auto pb-4 pt-1"
      >
        <div
          style={{
            width: A4_WIDTH * currentScale,
            height: A4_HEIGHT * currentScale,
            position: 'relative'
          }}
          className="transition-[width,height] duration-150 ease-out flex justify-center"
        >
          <div
            style={{
              width: A4_WIDTH,
              height: A4_HEIGHT,
              transform: `scale(${currentScale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          >
            <InvoicePreview invoice={invoice} settings={settings} />
          </div>
        </div>
      </div>

      {/* Fullscreen Modal View if user wants to see large version */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-between p-4 overflow-y-auto animate-in fade-in">
          {/* Modal Header */}
          <div className="w-full max-w-4xl flex items-center justify-between text-white pb-3 border-b border-white/20 mb-4">
            <span className="font-bold text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              Preview Layar Penuh - {invoice.invoiceNumber}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPrint}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Cetak / PDF
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-xs flex items-center gap-1 font-semibold"
              >
                <Minimize2 className="w-4 h-4" /> Tutup
              </button>
            </div>
          </div>

          {/* Large Invoice Document */}
          <div className="my-auto py-4">
            <div className="shadow-2xl rounded-sm">
              <InvoicePreview invoice={invoice} settings={settings} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
