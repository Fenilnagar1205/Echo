import { useState } from 'react'

import { useNavigate, Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'


const LoginPage = () => {
 
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')

  const [loading, setLoading] = useState(false)

  const { login } = useAuth()

  const navigate = useNavigate()


  const handleLogin = async (e) => {
    e.preventDefault()

    setError('')

    setLoading(true)

    try {
    
      await login(username, password)

      navigate('/')

    } catch (err) {

      setError('Invalid username or password')
    } finally {

      setLoading(false)
    }
  }


  return (
    <div style={styles.container}>

      {/* card */}
      <div style={styles.card}>

        {/* logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>💬</div>
          <h1 style={styles.logoText}>Echo</h1>
          <p style={styles.logoSub}>Welcome back!</p>
        </div>

        {/* error message */}
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* form */}
        <form onSubmit={handleLogin} style={styles.form}>

          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type='text'
              placeholder='Enter your username'
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>


          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type='password'
              placeholder='Enter your password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>


          <button
            type='submit'
            style={{
              ...styles.btn,
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        {/* register link */}
        <p style={styles.bottomText}>
          Don't have an account?{' '}
          <Link to='/register' style={styles.link}>
            Register
          </Link>
        </p>

      </div>
    </div>
  )
}


// styles object 
const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },

  card: {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',        
    boxShadow: '0 4px 24px rgba(108, 92, 231, 0.08)',
  },

  logoWrap: {
    textAlign: 'center',
    marginBottom: '28px',
  },

  logoIcon: {
    fontSize: '40px',
    marginBottom: '8px',
  },

  logoText: {
    fontSize: '26px',
    fontWeight: '600',
    color: '#6c5ce7',          
    marginBottom: '4px',
  },

  logoSub: {
    fontSize: '14px',
    color: '#999',
  },

  errorBox: {
    background: '#fff0f0',
    border: '1px solid #ffcccc',
    color: '#e53935',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'center',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1a2e',
  },

  input: {
    background: '#f5f5f5',
    border: '1.5px solid #eee',
    borderRadius: '10px',
    padding: '11px 14px',
    fontSize: '14px',
    color: '#1a1a2e',
    transition: 'border-color 0.2s',
    width: '100%',
  },

  btn: {
    background: '#6c5ce7',    
    color: '#ffffff',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '500',
    marginTop: '4px',
    transition: 'background 0.2s',
    width: '100%',
  },

  bottomText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#999',
    marginTop: '20px',
  },

  link: {
    color: '#6c5ce7',
    fontWeight: '500',
    textDecoration: 'none',
  },
}


export default LoginPage