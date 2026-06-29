import { useState } from 'react'
import api from '../services/api'


const Sidebar = ({
  rooms,
  loading,
  selectedRoom,
  onRoomSelect,
  currentUser,   
  onLogout,  
  onRoomCreated,  
}) => {

  const [search, setSearch] = useState('')

  const [showNewChat, setShowNewChat] = useState(false)

  const [newChatUsername, setNewChatUsername] = useState('')

  const [newChatError, setNewChatError] = useState('')

  const [creating, setCreating] = useState(false)


  
  const filteredRooms = rooms.filter(room => {
  
    const otherMember = room.members.find(m => m.id !== currentUser?.id)
    
    return otherMember?.username.toLowerCase().includes(search.toLowerCase())
  })

  const getOtherMember = (room) => {
    return room.members.find(m => m.id !== currentUser?.id)
  }

  const getInitials = (username) => {
    return username?.slice(0, 2).toUpperCase()
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  // create new chat room
  const handleCreateChat = async () => {
    setNewChatError('')
    setCreating(true)

    try {
      
      const searchResponse = await api.get(`/users/search/?username=${newChatUsername}`)
      const foundUser = searchResponse.data

      await api.post('/rooms/', { user_id: foundUser.id })

      onRoomCreated()

      setShowNewChat(false)
      setNewChatUsername('')

    } catch (err) {
      if (err.response?.status === 404) {
        setNewChatError('User not found')
      } else {
        setNewChatError('Something went wrong')
      }
    } finally {
      setCreating(false)
    }
  }

  const avatarColors = [
    { bg: '#dcd6ff', color: '#5e4db2' },
    { bg: '#d6f0ff', color: '#1565c0' },
    { bg: '#ffd6f0', color: '#c2185b' },
    { bg: '#d6ffd6', color: '#2e7d32' },
    { bg: '#fff3d6', color: '#f57f17' },
  ]

  const getAvatarColor = (username) => {
    const index = username?.charCodeAt(0) % avatarColors.length
    return avatarColors[index] || avatarColors[0]
  }


  return (
    <div style={styles.sidebar}>

      {/* header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Messages</h1>
        <div style={styles.headerIcons}>

          {/* new chat button */}
          <button
            style={styles.iconBtn}
            onClick={() => setShowNewChat(true)}
            title='New Chat'
          >
            ✏️
          </button>

          {/* logout button */}
          <button
            style={styles.iconBtn}
            onClick={onLogout}
            title='Logout'
          >
            🚪
          </button>

        </div>
      </div>

      {/* search bar */}
      <div style={styles.searchBar}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type='text'
          placeholder='Search chats...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* rooms list */}
      <div style={styles.roomList}>
        {loading ? (
          <p style={styles.emptyText}>Loading chats...</p>
        ) : filteredRooms.length === 0 ? (
          <p style={styles.emptyText}>No chats yet. Start a new one!</p>
        ) : (
          filteredRooms.map(room => {
            const otherMember = getOtherMember(room)
            const avatarColor = getAvatarColor(otherMember?.username)
            const isSelected = selectedRoom?.id === room.id

            return (
              <div
                key={room.id}
                style={{
                  ...styles.roomItem,
                  background: isSelected ? '#f0eeff' : 'transparent',
                }}
                onClick={() => onRoomSelect(room)}
              >
                {/* avatar */}
                <div style={{
                  ...styles.avatar,
                  background: avatarColor.bg,
                  color: avatarColor.color,
                }}>
                  {getInitials(otherMember?.username)}
                </div>

                {/* room info */}
                <div style={styles.roomInfo}>
                  <div style={styles.roomName}>
                    {otherMember?.username}
                  </div>
                  <div style={styles.lastMessage}>
                    {room.last_message?.content || 'No messages yet'}
                  </div>
                </div>

                {/* time */}
                <div style={styles.roomMeta}>
                  <span style={styles.time}>
                    {formatTime(room.last_message?.timestamp)}
                  </span>
                </div>

              </div>
            )
          })
        )}
      </div>

      {/* bottom nav */}
      <div style={styles.bottomNav}>
        <button style={{ ...styles.navItem, ...styles.navActive }}>
          <span>💬</span>
          <span style={styles.navLabel}>Chats</span>
        </button>
        <button style={styles.navItem}>
          <span>👥</span>
          <span style={styles.navLabel}>Contacts</span>
        </button>
        <button style={styles.navItem}>
          <span>⚙️</span>
          <span style={styles.navLabel}>Settings</span>
        </button>
        <button style={styles.navItem} onClick={onLogout}>
          <span>👤</span>
          <span style={styles.navLabel}>Profile</span>
        </button>
      </div>

      {/* new chat modal */}
      {showNewChat && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>

            <h3 style={styles.modalTitle}>New Chat</h3>
            <p style={styles.modalSub}>Enter username to start chatting</p>

            <input
              type='text'
              placeholder='Enter username...'
              value={newChatUsername}
              onChange={e => setNewChatUsername(e.target.value)}
              style={styles.modalInput}
              autoFocus
            />

            {newChatError && (
              <p style={styles.modalError}>{newChatError}</p>
            )}

            <div style={styles.modalBtns}>
              <button
                style={styles.modalCancel}
                onClick={() => {
                  setShowNewChat(false)
                  setNewChatUsername('')
                  setNewChatError('')
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.modalConfirm,
                  opacity: creating ? 0.7 : 1
                }}
                onClick={handleCreateChat}
                disabled={creating || !newChatUsername}
              >
                {creating ? 'Starting...' : 'Start Chat'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}


const styles = {
  sidebar: {
    width: '300px',
    minWidth: '300px',
    height: '100vh',
    background: '#ffffff',
    borderRight: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    // full width on mobile
    '@media (max-width: 640px)': {
      width: '100%',
    }
  },

  header: {
    padding: '20px 16px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a2e',
  },

  headerIcons: {
    display: 'flex',
    gap: '8px',
  },

  iconBtn: {
    background: '#f0eeff',
    border: 'none',
    borderRadius: '10px',
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
  },

  searchBar: {
    margin: '0 12px 12px',
    background: '#f5f5f5',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
  },

  searchIcon: {
    fontSize: '14px',
  },

  searchInput: {
    background: 'none',
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    color: '#1a1a2e',
    width: '100%',
  },

  roomList: {
    flex: 1,
    overflowY: 'auto',
  },

  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: '13px',
    padding: '32px 16px',
  },

  roomItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    cursor: 'pointer',
    borderRadius: '0',
    transition: 'background 0.15s',
  },

  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    flexShrink: 0,
  },

  roomInfo: {
    flex: 1,
    minWidth: 0,
  },

  roomName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '3px',
    textTransform: 'capitalize',
  },

  lastMessage: {
    fontSize: '12px',
    color: '#999',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  roomMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
    flexShrink: 0,
  },

  time: {
    fontSize: '11px',
    color: '#bbb',
  },

  bottomNav: {
    borderTop: '1px solid #eee',
    padding: '8px 0 4px',
    display: 'flex',
    justifyContent: 'space-around',
  },

  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '10px',
  },

  navActive: {
    background: '#f0eeff',
  },

  navLabel: {
    fontSize: '10px',
    color: '#999',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },

  modal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '28px 24px',
    width: '300px',
    boxShadow: '0 8px 32px rgba(108,92,231,0.15)',
  },

  modalTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '4px',
  },

  modalSub: {
    fontSize: '12px',
    color: '#999',
    marginBottom: '16px',
  },

  modalInput: {
    width: '100%',
    background: '#f5f5f5',
    border: '1.5px solid #eee',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#1a1a2e',
    marginBottom: '8px',
  },

  modalError: {
    color: '#e53935',
    fontSize: '12px',
    marginBottom: '8px',
  },

  modalBtns: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },

  modalCancel: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    background: '#f5f5f5',
    color: '#666',
    fontSize: '14px',
    fontWeight: '500',
  },

  modalConfirm: {
    flex: 1,
    padding: '10px',
    borderRadius: '10px',
    background: '#6c5ce7',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
  },
}


export default Sidebar