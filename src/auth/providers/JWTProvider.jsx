    
    import axios from 'axios'
    import { toast } from 'sonner'
    import { createContext, useState, useContext, useMemo } from 'react'
    import * as authHelper from '../_helpers'
    import { api } from '@/services/api'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { getCustomerHost, setCustomerHost, clearCustomerHost, getFixedCustomerHost } from '@/utils/customerHost'
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
        //?hash= (ACESSO AO PAINEL DE OUTRO CLIENTE): O TOKEN SALVO É DE OUTRO PAINEL. ESQUECE ANTES DE TUDO — SENÃO O MENU
        //JÁ PEDIA panel/menus COM ELE NO Customer-Host NOVO, TOMAVA 401 E O logout() DERRUBAVA A SESSÃO NOVA DO HASH
        const [ auth, setAuth ]               = useState(() => {
            if (new URLSearchParams(window.location.search).has('hash')) {
                authHelper.removeAuth()
                return null
            }
            return authHelper.getAuthToken()
        })
        const [ currentUser, setCurrentUser ] = useState()
        const [ isLogged, setIsLogged ]       = useState(false);

        window.api = api;

        //ACESSO DE SUPORTE ABERTO PELO PAINEL MESTRE (?hash=...&a=dominio). O FRONT SÓ REPASSA O HASH:
        //A API (panel/login-hash) CONFERE VALIDADE, CLIENTE E USO ÚNICO E DEVOLVE O TOKEN DE SESSÃO
        const loginPorHash = async (hash) => {

            //O HASH NÃO FICA NA URL NEM NO HISTÓRICO
            const params = new URLSearchParams(window.location.search)
            params.delete('hash')
            const query = params.toString()
            window.history.replaceState(window.history.state, '', window.location.pathname + (query ? '?' + query : ''))

            try {

                const { data: resposta } = await axios.post(
                    `${CAYMAN_API_URL}/panel/login-hash`,
                    { hash },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Customer-Host': getCustomerHost(),
                        },
                    }
                )

                const dados = resposta?.success?.response?.data
                if (!dados?.session_token) {
                    throw new Error('Acesso inválido ou expirado.')
                }

                //O DOMÍNIO DEVOLVIDO PELA API PASSA A SER O Customer-Host (O ?a= DA URL JÁ FOI SALVO, É O MESMO)
                if (dados.dominio) {
                    setCustomerHost(dados.dominio)
                }

                saveAuth({ status: true, data: dados })

                //RECARREGA: O "Acessar Painel" PODE VIR DE DENTRO DO PRÓPRIO SPA (PAINEL DE MÓDULOS NO MESMO ENDEREÇO),
                //COM MENU E MÓDULO DO OUTRO CLIENTE JÁ CARREGADOS. A URL JÁ ESTÁ SEM O hash
                window.location.reload()

            } catch (error) {

                if (isSystemNotFoundError(error)) notifySystemNotFound()

                //SEM ISSO CAI NO LOGIN SEM EXPLICAÇÃO (ex.: 403 api_disabled — O PAINEL REACT EXIGE API ATIVA NO CLIENTE)
                const motivo = error.response?.data?.error?.message || error.message || 'Acesso inválido ou expirado.'
                toast('❌ Não foi possível acessar o painel', {
                    description: <span style={{ color: 'white' }}>{motivo}</span>,
                    duration: 10000,
                    style: {
                        color: 'white',
                        background: 'var(--tw-danger)',
                        border: 'none',
                        fontWeight: 'bold'
                    }
                })

                saveAuth(undefined)
                setCurrentUser(undefined)

            }

        }

        const verify = async () => {

            const hash = new URLSearchParams(window.location.search).get('hash')
            if (hash) {
                await loginPorHash(hash)
                return
            }

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

            //ENTROU POR ?a=dominio: LOGIN DIRETO NO BANCO DESSE CLIENTE, COMO O index.php LEGADO
            if (getFixedCustomerHost()) {
                return loginNoPainel(login, senha)
            }

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

        /**
         * Login no painel de um cliente só (panel/login com o Customer-Host do ?a=). Igual ao
         * painel legado em painel.../?a=dominio: o usuário precisa existir naquele painel
         * (ex.: "admin"), não no cadastro central.
         */
        const loginNoPainel = async (login, senha) => {

            try {

                const { data: resposta } = await axios.post(
                    `${CAYMAN_API_URL}/panel/login`,
                    { login, senha },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Customer-Host': getCustomerHost(),
                        },
                    }
                )

                const dados = resposta?.success?.response?.data
                if (!dados?.session_token) {
                    throw new Error('Usuário ou senha inválidos.')
                }

                if (dados.dominio) {
                    setCustomerHost(dados.dominio)
                }

                saveAuth({ status: true, data: dados })

                const { data: user } = await newUser()

                setCurrentUser(user)

            } catch (error) {

                if (isSystemNotFoundError(error)) notifySystemNotFound()

                saveAuth(undefined)

                throw new Error(
                    error.response?.data?.error?.message ||
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

            //INVALIDA O TOKEN NA API (panel/logout) SEM ESPERAR A RESPOSTA — SE JÁ EXPIROU, O 401 É IGNORADO
            const token = authHelper.getAuthToken()
            if (token) {
                axios
                    .post(`${CAYMAN_API_URL}/panel/logout`, {}, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                            'Customer-Host': getCustomerHost(),
                        },
                    })
                    .catch(() => {})
            }

            saveAuth(undefined)
            setCurrentUser(undefined)
            // O próximo login pode pertencer a outro painel: esquece o cliente salvo (inclusive o do ?a=)
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
