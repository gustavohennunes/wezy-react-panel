    
    import axios from 'axios'
    import { createContext, useState, useContext, useMemo, useEffect } from 'react'
    import * as authHelper from '../_helpers'
    import { api } from '@/services/api'    
    import { buildApiUrl } from '@/utils/urlHelper'

    const API_URL = import.meta.env.VITE_APP_API_URL
    const CAYMAN_API_URL = import.meta.env.VITE_CAYMAN_API_URL

    export const CAYMAN_LOGIN_URL    = `${CAYMAN_API_URL}/panel/login`
    export const CAYMAN_REGISTER_URL = `${CAYMAN_API_URL}/panel/signup`
    export const FORGOT_PASSWORD_URL = `${API_URL}/forgot-password`
    export const RESET_PASSWORD_URL  = `${API_URL}/reset-password`
    export const GET_USER_URL        = `${CAYMAN_API_URL}/user-infos`

    const BTOKEN        = import.meta.env.VITE_BTOKEN
    const CUSTOMER_HOST = import.meta.env.VITE_CUSTOMER_HOST

    const AuthContext = createContext(null)

    const AuthProvider = ({ children }) => {
        
        const [ loading, setLoading ]         = useState(true)
        const [ auth, setAuth ]               = useState(authHelper.getAuthToken())
        const [ currentUser, setCurrentUser ] = useState()
        const [ slug, setSlug ]               = useState('')
        const [ action, setAction ]           = useState('')
        const [ userInfos, setUserInfos ]     = useState({});

        useEffect(() => {

            const params = new URLSearchParams(window.location.search)

            setSlug(params.get('slug') ?? params.get('pag'));
            setAction(params.get('action') ?? '');

        }, [ window.location.search ]);

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
                            Authorization: `Bearer ${BTOKEN}`,
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

        const register = async (name, email, phone, password, password_confirmation, terms) => {

            try {

                const { data: auth } = await axios.post(
                    CAYMAN_REGISTER_URL,
                    {
                        login: email,
                        senha: password,
                        'confirmacao-senha': password_confirmation,
                        nome: name,
                        telefone: phone,
                        termos: terms,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Customer-Host': CUSTOMER_HOST,
                            Authorization: `Bearer ${BTOKEN}`,
                        },
                    }
                )
                
                saveAuth(auth)

                const { data: user } = await newUser()

                setCurrentUser(user)

            } catch (error) {

                saveAuth(undefined)

                throw new Error(error.response?.data?.error?.message)

            }

        }

        const requestPasswordResetLink = async (email) => {
            
            await axios.post(FORGOT_PASSWORD_URL, {
                email,
            })

        }

        const changePassword = async ( email, token, password, password_confirmation ) => {
            await axios.post(RESET_PASSWORD_URL, { email, token, password, password_confirmation })
        }

        const getUser = async () => {
            
            let response = ''
            try{

                response = await api.get('/panel/module?slug=user-infos')
                
                return response.data.success.response.data

            } catch (error) {

                toast(`❌ Erro: `, {
                    description: <span style={{ 'color': 'white' }}>{error.response?.data?.error?.message || error.message}</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-danger)',
                        fontWeight: 'bold'
                    }
                })

            }

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

        const fetchUserInfos = async (slug, action) => {
            
            const getUserInfos = await getUser();
            if (getUserInfos.user.register_complete === false && slug !== 'perfil') {
                window.location.href = '/modulos?pag=perfil&action=finalizar-cadastro';
            } else if (getUserInfos.user.register_complete === true && slug === 'perfil' && action === 'finalizar-cadastro') {
                window.location.href = '/modulos';
            } else {
                setUserInfos(getUserInfos);
            }

        };

        useEffect(() => {
            
            if(slug != ''){
                fetchUserInfos(slug, action);
            }

        }, [ slug ]);

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
                    userInfos,
                    setUserInfos,
                    slug,
                    action
                }}
            >
                {children}
            </AuthContext.Provider>
        )
    }

    const useAuth = () => useContext(AuthContext)

    export { AuthContext, AuthProvider, useAuth }
