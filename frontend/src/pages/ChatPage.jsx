import { useState, useEffect } from 'react'

import { useAuth } from '../context/AuthContext'

import Sidebar from '../components/Sidebar'

import api from '../services/api'


const ChatPage = () => {

  const [selectedRoom, setSelectedRoom] = useState(null)

  const [rooms, setRooms] = useState([])

  const [loading, setLoading] = useState(true)

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)

  const { user, logout } = useAuth()

  useEffect(() => {
    fetchRooms()
  }, [])


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])


  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms/')
      setRooms(response.data)
    } catch (err) {
      console.error('Failed to fetch rooms:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoomSelect = (room) => {
    setSelectedRoom(room)
  }

  const handleBack = () => {
    setSelectedRoom(null)
  }

  const handleNewMessage = (message) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === message.room_id
          ? { ...room, last_message: message }
          : room
      )
    )
  }


  return (
    <div style={styles.container}>

      {/*
        Responsive logic:
        Mobile → show sidebar OR chat window (not both)
        Tablet/Desktop → show both side by side
      */}

      {/* sidebar — hidden on mobile when a room is selected */}
      {(!isMobile || !selectedRoom) && (
        <Sidebar
          rooms={rooms}
          loading={loading}
          selectedRoom={selectedRoom}
          onRoomSelect={handleRoomSelect}
          currentUser={user}
          onLogout={logout}
          onRoomCreated={fetchRooms}
        />
      )}

      {/* chat window — hidden on mobile when no room selected */}
      {(!isMobile || selectedRoom) && (
        selectedRoom
          ? (
            <ChatWindow
              room={selectedRoom}
              currentUser={user}
              onBack={handleBack}
              isMobile={isMobile}
              onNewMessage={handleNewMessage}
            />
          )
          : (
            // empty state — shown on desktop when no room selected
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>💬</div>
              <h2 style={styles.emptyTitle}>Welcome to Echo</h2>
              <p style={styles.emptyText}>
                Select a conversation to start chatting
              </p>
            </div>
          )
      )}

    </div>
  )
}


const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    background: '#f5f5f5',
    overflow: 'hidden',
  },

  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    gap: '12px',
  },

  emptyIcon: {
    fontSize: '56px',
    marginBottom: '8px',
  },

  emptyTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1a1a2e',
  },

  emptyText: {
    fontSize: '14px',
    color: '#999',
  },
}


export default ChatPage