import axios from 'axios'
import { createContext, useState, useContext } from 'react'
import * as authHelper from '../_helpers'
const API_URL = import.meta.env.VITE_APP_API_URL
const CAYMAN_API_URL_lOGIN = import.meta.env.VITE_CAYMAN_API_URL_lOGIN
export const LOGIN_URL = `${API_URL}/login`
export const CAYMAN_LOGIN_URL = `${CAYMAN_API_URL_lOGIN}`
export const REGISTER_URL = `${API_URL}/register`
export const FORGOT_PASSWORD_URL = `${API_URL}/forgot-password`
export const RESET_PASSWORD_URL = `${API_URL}/reset-password`
export const GET_USER_URL = `${API_URL}/user`
const BTOKEN = import.meta.env.VITE_BTOKEN
const CUSTOMER_HOST = import.meta.env.VITE_CUSTOMER_HOST
const AuthContext = createContext(null)
const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true)
    const [auth, setAuth] = useState(authHelper.getAuth())
    const [currentUser, setCurrentUser] = useState()
    const verify = async () => {
        if (auth) {
            try {
                const { data: user } = await newUser()
                setCurrentUser(user)
            } catch {
                saveAuth(undefined)
                setCurrentUser(undefined)
            }
        }
    }
    const saveAuth = (auth) => {
        setAuth(auth)
        if (auth) {
            authHelper.setAuth(auth)
            if (auth.success) {
                authHelper.setLocalAuth(
                    auth.success.response.data.session_token
                )
            }
        } else {
            authHelper.removeAuth()
        }
    }
    const login = async (login, senha) => {
        try {
            const { data: auth } = await axios.post(
                CAYMAN_LOGIN_URL,
                {
                    login: login,
                    senha: senha,
                },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Customer-Host': CUSTOMER_HOST,
                        Authorization: `Bearer ${BTOKEN}`
                    },
                }
            )

            saveAuth(auth)
            const { data: user } = await newUser()
            setCurrentUser(user)
        } catch (error) {
            saveAuth(undefined)
            throw new Error(`Error ${error}`)
        }
    }
    const register = async (email, password, password_confirmation) => {
        try {
            const { data: auth } = await axios.post(REGISTER_URL, {
                email,
                password,
                password_confirmation,
            })
            saveAuth(auth)
            const { data: user } = await getUser()
            setCurrentUser(user)
        } catch (error) {
            saveAuth(undefined)
            throw new Error(`Error ${error}`)
        }
    }
    const requestPasswordResetLink = async (email) => {
        await axios.post(FORGOT_PASSWORD_URL, {
            email,
        })
    }
    const changePassword = async (
        email,
        token,
        password,
        password_confirmation
    ) => {
        await axios.post(RESET_PASSWORD_URL, {
            email,
            token,
            password,
            password_confirmation,
        })
    }
    const getUser = async () => {
        return await axios.get(GET_USER_URL)
    }
    const newUser = async () => {
        //TODO
        return {
            data: {
                id: 1,
                first_name: 'Douglas',
                last_name: 'Feuser',
                role: 'user',
                status: 'active',
                email: 'douglas.feuser@gmail.com',
            },
        }
    }
    const logout = () => {
        saveAuth(undefined)
        setCurrentUser(undefined)
    }
    return (
        <AuthContext.Provider
            value={{
                loading,
                setLoading,
                auth,
                saveAuth,
                currentUser,
                setCurrentUser,
                login,
                register,
                requestPasswordResetLink,
                changePassword,
                getUser,
                newUser,
                logout,
                verify,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = () => useContext(AuthContext)

export { AuthContext, AuthProvider, useAuth }
