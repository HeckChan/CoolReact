import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function App() {
  const [memories, setMemories] = useState([])
  const [location, setLocation] = useState('')
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    fetchMemories()
  }, [])

  async function fetchMemories() {
    const { data } = await supabase.from('memories').select('*').order('created_at', { ascending: false })
    if (data) setMemories(data)
  }

  async function addMemory() {
    if (!location || !spotifyUrl) return
    await supabase.from('memories').insert([{ location, spotify_url: spotifyUrl, note }])
    setLocation(''); setSpotifyUrl(''); setNote('')
    fetchMemories()
  }

  function getEmbedUrl(url) {
    return url.replace('https://open.spotify.com/', 'https://open.spotify.com/embed/').split('?')[0]
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>🗺️ Travel Memories</h1>

      <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 12, marginBottom: 32 }}>
        <input placeholder="지역 (예: 제주도)" value={location} onChange={e => setLocation(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 8, borderRadius: 8, border: '1px solid #ddd' }} />
        <input placeholder="Spotify URL" value={spotifyUrl} onChange={e => setSpotifyUrl(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 8, borderRadius: 8, border: '1px solid #ddd' }} />
        <input placeholder="메모 (선택)" value={note} onChange={e => setNote(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 8, borderRadius: 8, border: '1px solid #ddd' }} />
        <button onClick={addMemory} style={{ padding: '8px 24px', background: '#1db954', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          추가
        </button>
      </div>

      {memories.map(m => (
        <div key={m.id} style={{ marginBottom: 24, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginBottom: 8 }}>{m.location}</h2>
          {m.note && <p style={{ color: '#666', marginBottom: 8 }}>{m.note}</p>}
          <iframe src={getEmbedUrl(m.spotify_url)} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
        </div>
      ))}
    </div>
  )
}

export default App