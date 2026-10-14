    
    import axios from 'axios'
    import { createContext, useState, useContext, useMemo } from 'react'
    import * as authHelper from '../_helpers'
    import { api } from '@/services/api'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { getCustomerHost, setCustomerHost, clearCustomerHost } from '@/utils/customerHost'
    import { isSystemNotFoundError, notifySystemNotFound } from '@/utils/systemStatus'

    const API_URL = import.meta.env.VITE_APP_API_URL
    const CAYMAN_API_URL = import.meta.env.VITE_CAYMAN_API_URL

    export const AUTH_MASTER_URL     = `${CAYMAN_API_URL}/auth/master`
    export const CAYMAN_REGISTER_URL = `${CAYMAN_API_URL}/panel/signup`
    export const FORGOT_PASSWORD_URL = `${CAYMAN_API_URL}/panel/forgot-password`
    // export const RESET_PASSWORD_URL  = `${API_URL}/reset-password`

    const AuthContext = createContext(null)

    const AuthProvider = ({ children }) => {
        
        const [ loading, setLoading ]         = useState(true)
        const [ auth, setAuth ]               = useState(() => authHelper.getAuthToken())
        const [ currentUser, setCurrentUser ] = useState()
        const [ isLogged, setIsLogged ]       = useState(false);

        window.api = api;

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

                // Auth centralizada (/auth/master) ou formato antigo do webservice
                const sessionToken =
                    auth.data?.session_token ??
                    auth.success?.response?.data?.session_token

                if (sessionToken) {
                    authHelper.setLocalAuth(sessionToken)
                }

            } else {
                authHelper.removeAuth()
            }

        }

        /**
         * Autentica na API centralizada (/auth/master) do domínio pai.
         *
         * Quando o mesmo login/senha existe em mais de um painel, a API
         * responde 409 com a lista de painéis; nesse caso é lançado um erro
         * com `code = 'MULTIPLE_PANELS'` e `paineis`, para a tela de login
         * exibir a escolha e reenviar com `idPainelCliente`.
         */
        const login = async (login, senha, idPainelCliente = null) => {

            try {

                const { data: auth } = await axios.post(
                    AUTH_MASTER_URL,
                    {
                        email: login,
                        senha: senha,
                        ...(idPainelCliente
                            ? { id_painel_cliente: idPainelCliente }
                            : {}),
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )

                if (!auth?.status || !auth?.data?.session_token) {
                    throw new Error(
                        auth?.message || 'Usuário ou senha inválidos.'
                    )
                }

                // As demais APIs do painel resolvem o cliente pelo host,
                // então o domínio retornado passa a ser o Customer-Host
                setCustomerHost(auth.data.dominio)

                saveAuth(auth)

                const { data: user } = await newUser()

                setCurrentUser(user)

            } catch (error) {

                const response = error.response

                if (
                    response?.status === 409 &&
                    Array.isArray(response.data?.paineis)
                ) {
                    const choiceError = new Error(response.data.message)
                    choiceError.code = 'MULTIPLE_PANELS'
                    choiceError.paineis = response.data.paineis
                    throw choiceError
                }

                if (isSystemNotFoundError(error)) notifySystemNotFound()

                saveAuth(undefined)

                throw new Error(
                    response?.data?.message ||
                        error.message ||
                        'Não foi possível autenticar. Tente novamente.'
                )

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
                            'Customer-Host': getCustomerHost(),
                            //SEM Authorization: panel/signup É ENDPOINT PÚBLICO NA API (publicEndpoints do
                            //Webservice.php). O TOKEN QUE IA AQUI ERA DE ADMINISTRADOR E FICAVA EXPOSTO NO BUNDLE
                        },
                    }
                )

                saveAuth(auth)

                const { data: user } = await newUser()

                setCurrentUser(user)

            } catch (error) {

                if (isSystemNotFoundError(error)) notifySystemNotFound()

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

        const newUser = async () => {

            //TODO
            return {
                data: {
                    id: 1,
                    first_name: 'User',
                    last_name: 'Name',
                    role: 'user',
                    status: 'active',
                    email: 'suporte@cayman.com.br',
                },
            }

        }

        //DADOS DO USUÁRIO LOGADO — VÊM DO PRÓPRIO /auth/master (data.usuario),
        //QUE JÁ FICA SALVO NO localStorage. NÃO EXIGE REQUISIÇÃO EXTRA.
        //DEPOIS DE RECARREGAR A PÁGINA O auth É SÓ O TOKEN (getAuthToken), ENTÃO O usuario
        //VEM DA RESPOSTA COMPLETA GUARDADA — ANTES O NOME E O LOGIN SUMIAM DO MENU DO USUÁRIO
        const usuarioLogado = useMemo(() => {

            const usuario = auth?.data?.usuario ?? (auth ? authHelper.getAuth()?.data?.usuario : null)
            if (!usuario) return null

            return {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.login,
                foto: usuario.foto,
                acesso: usuario.acesso,
                categoria: usuario.categoria,
            }

        }, [ auth ])

        const logout = () => {
            saveAuth(undefined)
            setCurrentUser(undefined)
            // O próximo login pode pertencer a outro painel
            clearCustomerHost()
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
                    usuarioLogado,
                    login,
                    register,
                    requestPasswordResetLink,
                    changePassword,
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
