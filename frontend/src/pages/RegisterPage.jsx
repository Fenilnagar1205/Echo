import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


const RegisterPage = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()


  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(username, email, password)
      navigate('/')

    } catch (err) {
      const data = err.response?.data
      if (data?.username) {
        setError('Username already taken')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }


  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>💬</div>
          <h1 style={styles.logoText}>Echo</h1>
          <p style={styles.logoSub}>Create your account</p>
        </div>

        {/* error */}
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* form */}
        <form onSubmit={handleRegister} style={styles.form}>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type='text'
              placeholder='Choose a username'
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type='email'
              placeholder='Enter your email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type='password'
              placeholder='Choose a password'
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
            {loading ? 'Creating account...' : 'Register'}
          </button>

        </form>

        <p style={styles.bottomText}>
          Already have an account?{' '}
          <Link to='/login' style={styles.link}>
            Login
          </Link>
        </p>

      </div>
    </div>
  )
}


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


export default RegisterPage