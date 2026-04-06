'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { FiCamera, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiLoader } from 'react-icons/fi'

interface ScanResult {
  status: 'success' | 'already' | 'error'
  member?: string
  event?: string
  message: string
}

export default function QRScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)
  const [processing, setProcessing] = useState(false)
  const scanIntervalRef = useRef<number | null>(null)
  const lastScannedRef = useRef<string>('')

  const isRu = typeof navigator !== 'undefined' && navigator.language?.startsWith('ru')

  const startCamera = useCallback(async () => {
    try {
      setCameraError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setScanning(true)
        startScanning()
      }
    } catch (err) {
      setCameraError(isRu ? 'Не удалось получить доступ к камере' : 'Failed to access camera')
    }
  }, [isRu])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setScanning(false)
  }, [])

  // Use BarcodeDetector API (available in Chrome/Edge) or fallback
  const startScanning = useCallback(() => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current)

    // Check if BarcodeDetector is available
    const hasBarcodeDetector = 'BarcodeDetector' in window

    scanIntervalRef.current = window.setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || processing) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      try {
        if (hasBarcodeDetector) {
          // @ts-ignore - BarcodeDetector is not in all TS defs
          const detector = new BarcodeDetector({ formats: ['qr_code'] })
          const barcodes = await detector.detect(canvas)
          if (barcodes.length > 0) {
            const url = barcodes[0].rawValue
            if (url && url.includes('/api/tickets/verify') && url !== lastScannedRef.current) {
              lastScannedRef.current = url
              await handleScan(url)
            }
          }
        }
      } catch {
        // BarcodeDetector failed, silently continue
      }
    }, 500)
  }, [processing])

  const handleScan = async (url: string) => {
    setProcessing(true)
    try {
      // Extract id from URL
      const urlObj = new URL(url)
      const id = urlObj.searchParams.get('id')
      if (!id) {
        setLastResult({ status: 'error', message: isRu ? 'Невалидный QR-код' : 'Invalid QR code' })
        setProcessing(false)
        return
      }

      const res = await fetch(`/api/tickets/verify?id=${id}`)
      const html = await res.text()

      // Parse result from HTML response
      if (html.includes('Check-In Successful')) {
        const memberMatch = html.match(/<div style="font-size:18px;font-weight:700;color:#1e293b">(.*?)<\/div>/)
        const eventMatch = html.match(/<div style="font-size:15px;font-weight:600;color:#1e293b">(.*?)<\/div>/)
        setLastResult({
          status: 'success',
          member: memberMatch?.[1] || '',
          event: eventMatch?.[1] || '',
          message: isRu ? 'Успешная регистрация!' : 'Check-in successful!',
        })
      } else if (html.includes('Already Checked In')) {
        const memberMatch = html.match(/<div style="font-size:18px;font-weight:700;color:#1e293b">(.*?)<\/div>/)
        setLastResult({
          status: 'already',
          member: memberMatch?.[1] || '',
          message: isRu ? 'Уже зарегистрирован' : 'Already checked in',
        })
      } else {
        setLastResult({
          status: 'error',
          message: isRu ? 'Билет не найден' : 'Ticket not found',
        })
      }
    } catch {
      setLastResult({
        status: 'error',
        message: isRu ? 'Ошибка при проверке' : 'Verification error',
      })
    } finally {
      setProcessing(false)
      // Allow re-scanning same ticket after 5s
      setTimeout(() => { lastScannedRef.current = '' }, 5000)
    }
  }

  // Manual URL input fallback
  const [manualInput, setManualInput] = useState('')
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.includes('/api/tickets/verify')) {
      handleScan(manualInput)
    } else if (manualInput.length > 10) {
      // Treat as registration ID
      const url = `${window.location.origin}/api/tickets/verify?id=${manualInput}`
      handleScan(url)
    }
    setManualInput('')
  }

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight">ACIK Scanner</h1>
            <p className="text-xs text-slate-400">{isRu ? 'Сканер QR-билетов' : 'QR Ticket Scanner'}</p>
          </div>
        </div>

        {/* Camera */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] mb-4">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-2 border-indigo-400/50 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-indigo-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-indigo-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-indigo-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-indigo-400 rounded-br-lg" />
                {/* Scanning line */}
                <div className="absolute left-2 right-2 h-0.5 bg-indigo-400/70 animate-scan" />
              </div>
            </div>
          )}

          {/* Processing overlay */}
          {processing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <FiLoader className="w-10 h-10 animate-spin text-indigo-400" />
            </div>
          )}

          {/* Camera button */}
          {!scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <button
                onClick={startCamera}
                className="flex flex-col items-center gap-3 text-slate-400 hover:text-white transition-colors"
              >
                <FiCamera className="w-12 h-12" />
                <span className="text-sm font-semibold">{isRu ? 'Нажмите для включения камеры' : 'Tap to start camera'}</span>
              </button>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-center p-4">
              <div>
                <FiAlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-300">{cameraError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Camera controls */}
        {scanning && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={stopCamera}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              {isRu ? 'Остановить' : 'Stop'}
            </button>
            <button
              onClick={() => { setLastResult(null); lastScannedRef.current = '' }}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              {isRu ? 'Сброс' : 'Reset'}
            </button>
          </div>
        )}

        {/* Manual input */}
        <form onSubmit={handleManualSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder={isRu ? 'ID билета или URL...' : 'Ticket ID or URL...'}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!manualInput || processing}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isRu ? 'Проверить' : 'Verify'}
            </button>
          </div>
        </form>

        {/* Result */}
        {lastResult && (
          <div className={`rounded-2xl p-5 mb-4 ${
            lastResult.status === 'success' ? 'bg-emerald-900/40 border border-emerald-700/50' :
            lastResult.status === 'already' ? 'bg-amber-900/40 border border-amber-700/50' :
            'bg-red-900/40 border border-red-700/50'
          }`}>
            <div className="flex items-start gap-3">
              {lastResult.status === 'success' ? (
                <FiCheckCircle className="w-8 h-8 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : lastResult.status === 'already' ? (
                <FiAlertCircle className="w-8 h-8 text-amber-400 flex-shrink-0 mt-0.5" />
              ) : (
                <FiAlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-bold text-lg ${
                  lastResult.status === 'success' ? 'text-emerald-300' :
                  lastResult.status === 'already' ? 'text-amber-300' :
                  'text-red-300'
                }`}>
                  {lastResult.message}
                </p>
                {lastResult.member && (
                  <p className="text-white font-semibold mt-1">{lastResult.member}</p>
                )}
                {lastResult.event && (
                  <p className="text-slate-400 text-sm mt-0.5">{lastResult.event}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-xs text-slate-500 space-y-1 mt-6">
          <p>{isRu ? 'Наведите камеру на QR-код билета' : 'Point camera at ticket QR code'}</p>
          <p>{isRu ? 'Или введите ID билета вручную' : 'Or enter ticket ID manually'}</p>
        </div>
      </div>

      {/* Scanning animation style */}
      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 8px; }
          50% { top: calc(100% - 8px); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
