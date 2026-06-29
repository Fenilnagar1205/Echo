import { createContext, useContext, useState, useEffect } from 'react'

import api from '../services/api'

const AuthContext = createContext()


export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const savedUser = localStorage.getItem('user')

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    setLoading(false)
  }, [])  

  //register function
  const register = async (username, email, password) => {
    const response = await api.post('/auth/register/', {
      username,
      email,
      password
    })

    const { tokens, user } = response.data

    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    localStorage.setItem('user', JSON.stringify(user))

    setUser(user)

    return response
  }

  // login function 
  const login = async (username, password) => {
    const response = await api.post('/auth/login/', {
      username,
      password
    })

    const { tokens, user } = response.data

    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    localStorage.setItem('user', JSON.stringify(user))

    setUser(user)

    return response
  }

  // logout function 
  const logout = () => {
    // remove all stored data
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    setUser(null)
  }

  return (

    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)