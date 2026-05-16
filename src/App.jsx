import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Leaflet 기본 아이콘 이슈 해결
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })
  return position === null ? null : <Marker position={position} />
}

function App() {
  const [memories, setMemories] = useState([])
  const [location, setLocation] = useState('')
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [note, setNote] = useState('')
  const [position, setPosition] = useState(null)

  useEffect(() => {
    fetchMemories()
  }, [])

  async function fetchMemories() {
    const { data } = await supabase.from('memories').select('*').order('created_at', { ascending: false })
    if (data) setMemories(data)
  }

  async function addMemory() {
    if (!location || !spotifyUrl) return
    const { error } = await supabase.from('memories').insert([{ 
      location, 
      spotify_url: spotifyUrl, 
      note,
      lat: position?.lat || null,
      lng: position?.lng || null
    }])
    
    if (!error) {
      setLocation(''); setSpotifyUrl(''); setNote(''); setPosition(null)
      fetchMemories()
    } else {
      alert('저장 중 오류가 발생했습니다. Supabase에 lat, lng 컬럼이 있는지 확인해 주세요!')
    }
  }

  function getEmbedUrl(url) {
    if (!url) return ''
    return url.replace('https://open.spotify.com/', 'https://open.spotify.com/embed/').split('?')[0]
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif', backgroundColor: '#fff', minHeight: '100vh' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>🗺️ Travel Memories</h1>

      {/* 입력 섹션 */}
      <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 16, marginBottom: 32, border: '1px solid #eee' }}>
        <input placeholder="지역 (예: 제주도)" value={location} onChange={e => setLocation(e.target.value)}
          style={{ width: '100%', padding: 12, marginBottom: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '16px' }} />
        <input placeholder="Spotify URL" value={spotifyUrl} onChange={e => setSpotifyUrl(e.target.value)}
          style={{ width: '100%', padding: 12, marginBottom: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '16px' }} />
        <input placeholder="메모 (선택)" value={note} onChange={e => setNote(e.target.value)}
          style={{ width: '100%', padding: 12, marginBottom: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: '16px' }} />
        
        <p style={{ fontSize: '14px', color: '#666', marginBottom: 8 }}>📍 지도에서 위치를 클릭해 주세요:</p>
        <div style={{ height: 250, borderRadius: 12, overflow: 'hidden', marginBottom: 16, border: '1px solid #ddd' }}>
          <MapContainer center={[37.5665, 126.9780]} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        <button onClick={addMemory} style={{ width: '100%', padding: '14px', background: '#1db954', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
          추억 추가하기
        </button>
      </div>

      {/* 리스트 섹션 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {memories.map(m => (
          <div key={m.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: 12, fontSize: '20px' }}>{m.location}</h2>
            {m.note && <p style={{ color: '#555', marginBottom: 16, lineHeight: '1.5' }}>{m.note}</p>}
            
            <iframe src={getEmbedUrl(m.spotify_url)} width="100%" height="80" frameBorder="0" style={{ borderRadius: 12, marginBottom: 16 }} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
            
            {m.lat && m.lng && (
              <div style={{ height: 180, borderRadius: 12, overflow: 'hidden', border: '1px solid #eee' }}>
                <MapContainer center={[m.lat, m.lng]} zoom={13} style={{ height: '100%', width: '100%' }} dragging={false} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[m.lat, m.lng]} />
                </MapContainer>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App