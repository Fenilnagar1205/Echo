import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'


import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'


// ProtectedRoute — only logged in users can access
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to='/login' />

  return children
}


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />

          {/* protected route */}
          <Route path='/' element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />

          {/* redirect unknown URLs to home */}
          <Route path='*' element={<Navigate to='/' />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App