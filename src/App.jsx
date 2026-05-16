import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { motion, AnimatePresence } from 'motion/react'
import RotatingText from './RotatingText'

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

  return position === null ? null : (
    <Marker position={position}>
      <Popup>여기에 기록할까요?</Popup>
    </Marker>
  )
}

function App() {
  const [memories, setMemories] = useState([])
  const [location, setLocation] = useState('')
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [note, setNote] = useState('')
  const [position, setPosition] = useState(null)
  const [view, setView] = useState('home') // 'home' or 'musimap'

  useEffect(() => {
    fetchMemories()
    document.body.setAttribute('data-view', view)
  }, [view])

  async function fetchMemories() {
    const { data } = await supabase.from('memories').select('*').order('created_at', { ascending: false })
    if (data) setMemories(data)
  }

  async function addMemory() {
    if (!location || !spotifyUrl) {
      alert('지역과 Spotify URL은 필수입니다!')
      return
    }
    
    const newMemory = { 
      location, 
      spotify_url: spotifyUrl, 
      note,
      lat: position?.lat || null,
      lng: position?.lng || null
    }

    const { error } = await supabase.from('memories').insert([newMemory])
    
    if (error) {
      console.error('Error adding memory:', error)
      alert('저장 중 오류가 발생했습니다. (Supabase 테이블에 lat, lng 컬럼이 있는지 확인해주세요!)')
    } else {
      setLocation(''); setSpotifyUrl(''); setNote(''); setPosition(null)
      fetchMemories()
      setView('musimap')
    }
  }

  function getEmbedUrl(url) {
    if (!url) return ''
    return url.replace('https://open.spotify.com/', 'https://open.spotify.com/embed/').split('?')[0]
  }

  return (
    <div className="app">
      <header className="app-header">
        <button className="brand" onClick={() => setView('home')}>
          <div className="brand-mark"></div>
          <span className="brand-name">TRAV</span>
        </button>
        <button className="cta-btn" onClick={() => setView(view === 'home' ? 'musimap' : 'home')}>
          {view === 'home' ? '지도 보기' : '홈으로'}
        </button>
      </header>

      <main className="app-main">
        {/* 홈 화면 */}
        <div className={`view ${view === 'home' ? 'view--active' : ''}`}>
          <section className="hero">
            <div>
              <p className="eyebrow">YOUR MUSICAL JOURNEY</p>
              <h1 className="headline">
                여행의 순간을<br />
                <RotatingText 
                  texts={['음악으로', '지도로', '감성으로']}
                  mainClassName="about-rotating-main"
                  staggerDuration={0.025}
                />
                <br />기록하세요.
              </h1>
              <p className="subcopy">지도를 클릭해 위치를 지정하고, 그곳의 분위기를 담은 음악을 함께 저장해보세요.</p>
              
              <div className="hero-actions" style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                  <input 
                    placeholder="어디였나요? (예: 제주도 애월)" 
                    value={location} 
                    onChange={e => setLocation(e.target.value)}
                    className="card"
                    style={{ width: '100%', outline: 'none' }} 
                  />
                  <input 
                    placeholder="Spotify 곡/플레이리스트 URL" 
                    value={spotifyUrl} 
                    onChange={e => setSpotifyUrl(e.target.value)}
                    className="card"
                    style={{ width: '100%', outline: 'none' }} 
                  />
                  <textarea 
                    placeholder="그때의 감정을 짧게 적어주세요 (선택)" 
                    value={note} 
                    onChange={e => setNote(e.target.value)}
                    className="card"
                    style={{ width: '100%', minHeight: 80, outline: 'none', resize: 'none' }} 
                  />
                  
                  <div style={{ height: 200, borderRadius: 16, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <MapContainer center={[37.5665, 126.9780]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#666' }}>* 지도를 클릭해 위치를 콕 찍어주세요!</p>

                  <button onClick={addMemory} className="btn btn--primary" style={{ padding: '14px' }}>
                    추억 저장하기
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 지도/목록 화면 */}
        <div className={`view ${view === 'musimap' ? 'view--active' : ''}`}>
          <div className="musimap">
            <div className="musimap-header">
              <div>
                <h2 style={{ margin: 0 }}>나의 MusiMap</h2>
                <p className="musimap-note">우리가 함께 걸었던 소리들</p>
              </div>
            </div>

            <div className="musimap-map" style={{ marginTop: 20 }}>
              <MapContainer center={[37.5665, 126.9780]} zoom={7} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {memories.filter(m => m.lat && m.lng).map(m => (
                  <Marker key={m.id} position={[m.lat, m.lng]}>
                    <Popup>
                      <div style={{ width: 200 }}>
                        <h3 style={{ margin: '0 0 8px' }}>{m.location}</h3>
                        <p style={{ fontSize: '0.85rem', marginBottom: 8 }}>{m.note}</p>
                        <iframe src={getEmbedUrl(m.spotify_url)} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div className="cards" style={{ marginTop: 24 }}>
              {memories.map(m => (
                <div key={m.id} className="card">
                  <h2 style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {m.location}
                    <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: '#999' }}>
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </h2>
                  {m.note && <p style={{ marginBottom: 12 }}>{m.note}</p>}
                  <iframe src={getEmbedUrl(m.spotify_url)} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <nav className="app-nav">
        <button className={`nav-item ${view === 'home' ? 'nav-item--active' : ''}`} onClick={() => setView('home')}>
          <div className="nav-dot"></div>
          <span className="nav-label">Home</span>
        </button>
        <button className={`nav-item ${view === 'musimap' ? 'nav-item--active' : ''}`} onClick={() => setView('musimap')}>
          <div className="nav-dot"></div>
          <span className="nav-label">Map</span>
        </button>
      </nav>
    </div>
  )
}

export default App