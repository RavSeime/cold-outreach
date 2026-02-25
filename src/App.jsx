import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [checkResult, setCheckResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [message, setMessage] = useState('')
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [cyberpunk, setCyberpunk] = useState(() => {
    const saved = localStorage.getItem('cyberpunk-theme')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('cyberpunk-theme', JSON.stringify(cyberpunk))
    if (cyberpunk) {
      document.documentElement.classList.add('cyberpunk')
    } else {
      document.documentElement.classList.remove('cyberpunk')
    }
  }, [cyberpunk])

  const handleCheck = async () => {
    if (!phone && !email) {
      setMessage('Please enter a phone number or email.')
      return
    }

    setLoading(true)
    setMessage('')
    setCheckResult(null)

    try {
      let query = supabase.from('outreaches').select('*')

      // Build dynamic OR filter
      if (phone && email) {
        query = query.or(`phone.eq.${phone},email.eq.${email}`)
      } else if (phone) {
        query = query.eq('phone', phone)
      } else if (email) {
        query = query.eq('email', email)
      }

      const { data, error } = await query

      if (error) {
        setMessage(`Error checking database: ${error.message}`)
        return
      }

      if (data && data.length > 0) {
        setCheckResult({ found: true, entries: data })
        setMessage('')
      } else {
        setCheckResult({ found: false })
        setMessage('')
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.from('outreaches').insert({
        phone: phone || null,
        email: email || null,
      })

      if (error) {
        setMessage(`Error adding to database: ${error.message}`)
        return
      }

      setMessage('✓ Successfully added to database!')
      setPhone('')
      setEmail('')
      setCheckResult(null)
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleViewHistory = async () => {
    if (showHistory) {
      setShowHistory(false)
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('outreaches')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setMessage(`Error loading history: ${error.message}`)
        return
      }

      setHistory(data || [])
      setShowHistory(true)
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Cold Outreach Checker</h1>
        <button className="theme-toggle" onClick={() => setCyberpunk(!cyberpunk)} title="Toggle cyberpunk theme">
          {cyberpunk ? '◆' : '◇'}
        </button>
      </div>

      <div className="info-section">
        <button className="info-toggle" onClick={() => setShowHowItWorks(!showHowItWorks)}>
          {showHowItWorks ? '▼' : '▶'} How it works
        </button>
        {showHowItWorks && (
          <div className="how-it-works">
            <ol>
              <li><strong>Enter a contact:</strong> Type a phone number and/or email address</li>
              <li><strong>Check the database:</strong> Click "Check" to see if we've already reached out to this person</li>
              <li><strong>Already contacted?</strong> If yes, you'll see when we contacted them. Skip this prospect.</li>
              <li><strong>New prospect?</strong> If no, click "Add to Database" to log it</li>
              <li><strong>Make the call/email:</strong> Now you can reach out to them</li>
              <li><strong>View history:</strong> Click "View History" to see all logged outreaches</li>
            </ol>
          </div>
        )}
      </div>

      <div className="form-section">
        <div className="input-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="text"
            placeholder="+1 (555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <button onClick={handleCheck} disabled={loading || (!phone && !email)}>
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>

      {message && <div className="message">{message}</div>}

      {checkResult && (
        <div className="result-section">
          {checkResult.found ? (
            <div className="result warning">
              <strong>⚠ Already contacted</strong>
              <ul>
                {checkResult.entries.map((entry) => (
                  <li key={entry.id}>
                    {entry.phone && <span>Phone: {entry.phone}</span>}
                    {entry.phone && entry.email && <span> | </span>}
                    {entry.email && <span>Email: {entry.email}</span>}
                    <br />
                    <small>{formatDate(entry.created_at)}</small>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="result success">
              <strong>✓ Not in database</strong>
              <button onClick={handleAdd} disabled={loading}>
                {loading ? 'Adding...' : 'Add to Database'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="history-section">
        <button onClick={handleViewHistory} disabled={loading}>
          {showHistory ? '▼ Hide History' : '▸ View History'}
        </button>

        {showHistory && (
          <div className="history-table">
            {history.length === 0 ? (
              <p>No outreaches logged yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.phone || '—'}</td>
                      <td>{entry.email || '—'}</td>
                      <td>{formatDate(entry.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
