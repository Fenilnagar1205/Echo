import { useState, useEffect, useRef } from 'react'
import api from '../services/api'


const ChatWindow = ({
  room,         
  currentUser,
  onBack,
  isMobile,
  onNewMessage,
}) => {

  const [messages, setMessages] = useState([])

  const [messageText, setMessageText] = useState('')

  const [loading, setLoading] = useState(true)

  const wsRef = useRef(null)

  const messagesEndRef = useRef(null)

  const otherMember = room.members.find(m => m.id !== currentUser?.id)

  useEffect(() => {
    fetchMessages()
    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [room.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])


  const fetchMessages = async () => {
    setLoading(true)
    try {
      // GET /api/rooms/<id>/messages/
      const response = await api.get(`/rooms/${room.id}/messages/`)
      setMessages(response.data)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setLoading(false)
    }
  }


  const connectWebSocket = () => {

    const token = localStorage.getItem('access_token')

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${room.id}/?token=${token}`
    )

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {

      const data = JSON.parse(event.data)

      if (data.type === 'chat_message') {
  
        setMessages(prevMessages => [...prevMessages, data.message])

        onNewMessage({ ...data.message, room_id: room.id })
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    wsRef.current = ws
  }


  const handleSend = (e) => {
    e.preventDefault()

    if (!messageText.trim()) return

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {

      wsRef.current.send(JSON.stringify({
        content: messageText
      }))

      setMessageText('')
    }
  }


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (username) => {
    return username?.slice(0, 2).toUpperCase()
  }


  return (
    <div style={styles.container}>

      {/* header */}
      <div style={styles.header}>

        {/* back button — only on mobile */}
        {isMobile && (
          <button style={styles.backBtn} onClick={onBack}>
            ←
          </button>
        )}

        {/* avatar */}
        <div style={styles.headerAvatar}>
          {getInitials(otherMember?.username)}
        </div>

        {/* name and status */}
        <div style={styles.headerInfo}>
          <div style={styles.headerName}>{otherMember?.username}</div>
          <div style={styles.headerStatus}>● online</div>
        </div>

        {/* action icons */}
        <div style={styles.headerActions}>
          <button style={styles.headerIconBtn}>📞</button>
          <button style={styles.headerIconBtn}>⋮</button>
        </div>

      </div>

      {/* messages */}
      <div style={styles.messages}>
        {loading ? (
          <p style={styles.loadingText}>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p style={styles.loadingText}>No messages yet. Say hi! 👋</p>
        ) : (
          messages.map(message => {
            const isSent = message.sender === currentUser?.id ||
                           message.sender_username === currentUser?.username

            return (
              <div
                key={message.id}
                style={{
                  ...styles.messageWrap,
                  alignSelf: isSent ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  ...styles.bubble,
                  background: isSent ? '#6c5ce7' : '#ffffff',
                  color: isSent ? '#ffffff' : '#1a1a2e',
                  borderBottomRightRadius: isSent ? '4px' : '14px',
                  borderBottomLeftRadius: isSent ? '14px' : '4px',
                }}>
                  {message.content}
                </div>
                <span style={{
                  ...styles.msgTime,
                  textAlign: isSent ? 'right' : 'left',
                }}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
            )
          })
        )}

        {/* invisible div used as scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* input area */}
      <form style={styles.inputArea} onSubmit={handleSend}>
        <button type='button' style={styles.attachBtn}>📎</button>
        <input
          type='text'
          placeholder='Type a message...'
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          style={styles.msgInput}
        />
        <button type='submit' style={styles.sendBtn}>
          ➤
        </button>
      </form>

    </div>
  )
}


const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#f5f5f5',
    height: '100vh',
  },

  header: {
    background: '#ffffff',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #eee',
  },

  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#6c5ce7',
    cursor: 'pointer',
    padding: '4px',
  },

  headerAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: '#dcd6ff',
    color: '#5e4db2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
  },

  headerInfo: {
    flex: 1,
  },

  headerName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a2e',
    textTransform: 'capitalize',
  },

  headerStatus: {
    fontSize: '12px',
    color: '#00c853',
  },

  headerActions: {
    display: 'flex',
    gap: '8px',
  },

  headerIconBtn: {
    background: '#f0eeff',
    border: 'none',
    borderRadius: '10px',
    width: '34px',
    height: '34px',
    fontSize: '14px',
    cursor: 'pointer',
  },

  messages: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  loadingText: {
    textAlign: 'center',
    color: '#999',
    fontSize: '13px',
    marginTop: '20px',
  },

  messageWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    maxWidth: '65%',
  },

  bubble: {
    padding: '10px 14px',
    borderRadius: '14px',
    fontSize: '13px',
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },

  msgTime: {
    fontSize: '10px',
    color: '#aaa',
  },

  inputArea: {
    background: '#ffffff',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderTop: '1px solid #eee',
  },

  attachBtn: {
    background: '#f0eeff',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    fontSize: '16px',
    cursor: 'pointer',
    flexShrink: 0,
  },

  msgInput: {
    flex: 1,
    background: '#f5f5f5',
    border: 'none',
    borderRadius: '999px',
    padding: '10px 16px',
    fontSize: '13px',
    color: '#1a1a2e',
  },

  sendBtn: {
    background: '#6c5ce7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    fontSize: '15px',
    cursor: 'pointer',
    flexShrink: 0,
  },
}


export default ChatWindow