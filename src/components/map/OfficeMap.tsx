'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface OfficeMapProps {
  latitude: number
  longitude: number
  radius: number
  onLocationSelect: (lat: number, lng: number) => void
}

export default function OfficeMap({ latitude, longitude, radius, onLocationSelect }: OfficeMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Fix default marker icon
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })

    const map = L.map(containerRef.current).setView([latitude, longitude], 15)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map)
    const circle = L.circle([latitude, longitude], {
      radius: radius,
      color: '#4f46e5',
      fillColor: '#4f46e5',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map)

    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      circle.setLatLng(pos)
      onLocationSelect(pos.lat, pos.lng)
    })

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng)
      circle.setLatLng(e.latlng)
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    })

    mapRef.current = map
    markerRef.current = marker
    circleRef.current = circle

    return () => {
      map.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update marker/circle when props change
  useEffect(() => {
    if (markerRef.current && circleRef.current) {
      markerRef.current.setLatLng([latitude, longitude])
      circleRef.current.setLatLng([latitude, longitude])
      circleRef.current.setRadius(radius)
    }
  }, [latitude, longitude, radius])

  return (
    <div
      ref={containerRef}
      style={{ height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden' }}
    />
  )
}
