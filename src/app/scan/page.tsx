'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { FiCamera, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiLoader } from 'react-icons/fi'
import jsQR from 'jsqr'

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
  const animFrameRef = useRef<number>(0)
  const lastScannedRef = useRef<string>('')
  const processingRef = useRef(false)

  const isRu = typeof navigator !== 'undefined' && navigator.language?.startsWith('ru')

  // ── Camera ──

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
      }
    } catch {
      setCameraError(isRu ? 'Нет доступа к камере. Разрешите в настройках браузера.' : 'Camera access denied. Allow it in browser settings.')
    }
  }, [isRu])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = 0
    }
    setScanning(false)
  }, [])

  // ── Scan loop using jsQR ──

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      animFrameRef.current = requestAnimationFrame(scanFrame)
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const qr = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })

    if (qr && qr.data && !processingRef.current) {
      const url = qr.data
      if (url.includes('/api/tickets/verify') && url !== lastScannedRef.current) {
        lastScannedRef.current = url
        handleScan(url)
      } else if (url.length > 20 && url.length < 60 && !url.includes('http') && url !== lastScannedRef.current) {
        // Might be a raw registration ID
        lastScannedRef.current = url
        handleScan(`${window.location.origin}/api/tickets/verify?id=${url}`)
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame)
  }, [])

  // Start scanning when camera is ready
  useEffect(() => {
    if (scanning) {
      animFrameRef.current = requestAnimationFrame(scanFrame)
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [scanning, scanFrame])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  // ── Handle scan result ──

  const handleScan = async (url: string) => {
    processingRef.current = true
    setProcessing(true)

    try {
      const urlObj = new URL(url)
      const id = urlObj.searchParams.get('id')
      if (!id) {
        setLastResult({ status: 'error', message: isRu ? 'QR-kod ne valid' : 'Invalid QR code' })
        return
      }

      const res = await fetch(`/api/tickets/verify?id=${id}`)
      const html = await res.text()

      // Parse the HTML response
      if (html.includes('Check-In Successful')) {
        const memberMatch = html.match(/font-size:18px;font-weight:700;color:#1e293b">(.*?)<\/div>/)
        const eventMatch = html.match(/font-size:15px;font-weight:600;color:#1e293b">(.*?)<\/div>/)
        setLastResult({
          status: 'success',
          member: memberMatch?.[1] || 'Guest',
          event: eventMatch?.[1] || '',
          message: 'Check-in OK!',
        })
        playSound(true)
      } else if (html.includes('Already Checked In')) {
        const memberMatch = html.match(/font-size:18px;font-weight:700;color:#1e293b">(.*?)<\/div>/)
        setLastResult({
          status: 'already',
          member: memberMatch?.[1] || 'Guest',
          message: isRu ? 'Uzhe otmechen' : 'Already checked in',
        })
        playSound(false)
      } else {
        setLastResult({
          status: 'error',
          message: isRu ? 'Bilet ne najden' : 'Ticket not found',
        })
        playSound(false)
      }
    } catch {
      setLastResult({
        status: 'error',
        message: isRu ? 'Oshibka proverki' : 'Verification error',
      })
    } finally {
      processingRef.current = false
      setProcessing(false)
      // Allow re-scanning same code after 4s
      setTimeout(() => { lastScannedRef.current = '' }, 4000)
    }
  }

  // ── Sound feedback ──

  const playSound = (success: boolean) => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      if (success) {
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
      } else {
        osc.frequency.setValueAtTime(330, ctx.currentTime)
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
      }
    } catch { /* ignore audio errors */ }
  }

  // ── Manual input ──

  const [manualInput, setManualInput] = useState('')
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    if (manualInput.includes('/api/tickets/verify')) {
      handleScan(manualInput)
    } else if (manualInput.trim().length > 10) {
      handleScan(`${window.location.origin}/api/tickets/verify?id=${manualInput.trim()}`)
    }
    setManualInput('')
  }

  // ── Render ──

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight">ACIK Scanner</h1>
            <p className="text-xs text-slate-400">QR Ticket Scanner</p>
          </div>
        </div>

        {/* Camera viewport */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] mb-4">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan frame overlay */}
          {scanning && !processing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 relative">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-indigo-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-indigo-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-indigo-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-indigo-400 rounded-br-xl" />
                {/* Laser line */}
                <div className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-[scanLine_2s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          {/* Processing spinner */}
          {processing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <FiLoader className="w-12 h-12 animate-spin text-indigo-400" />
            </div>
          )}

          {/* Start camera button */}
          {!scanning && !cameraError && (
            <button
              onClick={startCamera}
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 hover:bg-slate-750 transition-colors gap-3 cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-indigo-600/20 flex items-center justify-center">
                <FiCamera className="w-10 h-10 text-indigo-400" />
              </div>
              <span className="text-sm font-semibold text-slate-400">
                {isRu ? 'Tap to start' : 'Tap to start camera'}
              </span>
            </button>
          )}

          {/* Camera error */}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-center p-6">
              <div>
                <FiAlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-sm text-red-300 mb-3">{cameraError}</p>
                <button onClick={startCamera} className="text-xs text-indigo-400 font-semibold hover:text-indigo-300">
                  {isRu ? 'Retry' : 'Try again'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {scanning && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={stopCamera}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              Stop
            </button>
            <button
              onClick={() => { setLastResult(null); lastScannedRef.current = '' }}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              Reset
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
              placeholder="Ticket ID..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || processing}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Verify
            </button>
          </div>
        </form>

        {/* Result card */}
        {lastResult && (
          <div className={`rounded-2xl p-5 mb-4 border ${
            lastResult.status === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : lastResult.status === 'already'
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-start gap-3">
              {lastResult.status === 'success' ? (
                <FiCheckCircle className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              ) : lastResult.status === 'already' ? (
                <FiAlertCircle className="w-8 h-8 text-amber-400 flex-shrink-0" />
              ) : (
                <FiAlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
              )}
              <div>
                <p className={`font-bold text-lg ${
                  lastResult.status === 'success' ? 'text-emerald-300' :
                  lastResult.status === 'already' ? 'text-amber-300' : 'text-red-300'
                }`}>
                  {lastResult.message}
                </p>
                {lastResult.member && (
                  <p className="text-white font-semibold mt-1 text-lg">{lastResult.member}</p>
                )}
                {lastResult.event && (
                  <p className="text-slate-400 text-sm mt-0.5">{lastResult.event}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="text-center text-xs text-slate-600 mt-8 space-y-1">
          <p>Point camera at ticket QR code</p>
          <p>Or enter ticket ID manually</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scanLine {
          0%, 100% { top: 12px; }
          50% { top: calc(100% - 12px); }
        }
      `}</style>
    </div>
  )
}
