
    import { toast } from 'sonner'
    import { createContext, useState, useContext, useMemo, useCallback } from 'react'
    import * as authHelper from '../_helpers'
    import { api } from '@/services/api'
    import { clearCustomerHost, getFixedCustomerHost } from '@/utils/customerHost'
    import { hashDaUrl, gravarSessao, entrarPorHash, entrarNoCentral, entrarNoPainel, cadastrar, encerrarSessaoNaApi, usuarioDaSessao } from './authApi'

    //O JS DOS CARTÕES LEGADOS USA O CLIENTE DA API DO PAINEL (window.api)
    if (typeof window !== 'undefined') {
        window.api = api
    }

    const AuthContext = createContext(null)

    //?hash= (ACESSO AO PAINEL DE OUTRO CLIENTE): O TOKEN SALVO É DE OUTRO PAINEL. ESQUECE ANTES DE TUDO — SENÃO O MENU
    //JÁ PEDIA panel/menus COM ELE NO Customer-Host NOVO, TOMAVA 401 E O logout() DERRUBAVA A SESSÃO NOVA DO HASH
    const sessaoInicial = () => {
        if (hashDaUrl()) {
            authHelper.removeAuth()
            return null
        }
        return authHelper.getAuthToken()
    }

    const AuthProvider = ({ children }) => {

        const [ loading, setLoading ] = useState(true)
        const [ auth, setAuth ]       = useState(sessaoInicial)

        const saveAuth = useCallback((sessao) => {
            setAuth(sessao)
            gravarSessao(sessao)
        }, [])

        //ACESSO DE SUPORTE: RECARREGA DEPOIS DE ENTRAR — O "Acessar Painel" PODE VIR DE DENTRO DO PRÓPRIO SPA (PAINEL DE
        //MÓDULOS NO MESMO ENDEREÇO), COM MENU E MÓDULO DO OUTRO CLIENTE JÁ CARREGADOS. A URL JÁ ESTÁ SEM O hash
        const loginPorHash = useCallback(async (hash) => {
            try {
                saveAuth(await entrarPorHash(hash))
                window.location.reload()
            } catch (error) {
                toast('❌ Não foi possível acessar o painel', {
                    description: <span style={{ color: 'white' }}>{error.message}</span>,
                    duration: 10000,
                    style: { color: 'white', background: 'var(--tw-danger)', border: 'none', fontWeight: 'bold' },
                })
                saveAuth(undefined)
            }
        }, [saveAuth])

        const verify = useCallback(async () => {
            const hash = hashDaUrl()
            if (hash) await loginPorHash(hash)
        }, [loginPorHash])

        //FALHA NO LOGIN/CADASTRO TAMBÉM ESQUECE A SESSÃO ANTERIOR
        const entrarCom = useCallback(async (pedirSessao) => {
            try {
                saveAuth(await pedirSessao())
            } catch (error) {
                if (error.code !== 'MULTIPLE_PANELS') saveAuth(undefined)
                throw error
            }
        }, [saveAuth])

        //ENTROU POR ?a=dominio: LOGIN DIRETO NO BANCO DESSE CLIENTE, COMO O index.php LEGADO
        const login = useCallback((usuario, senha, idPainelCliente = null) =>
            entrarCom(() => (getFixedCustomerHost() ? entrarNoPainel(usuario, senha) : entrarNoCentral(usuario, senha, idPainelCliente))),
        [entrarCom])

        const register = useCallback((...dados) => entrarCom(() => cadastrar(...dados)), [entrarCom])

        const logout = useCallback(() => {
            encerrarSessaoNaApi()
            saveAuth(undefined)
            // O próximo login pode pertencer a outro painel: esquece o cliente salvo (inclusive o do ?a=)
            clearCustomerHost()
        }, [saveAuth])

        const usuarioLogado = useMemo(() => usuarioDaSessao(auth), [auth])

        const value = useMemo(
            () => ({ loading, setLoading, auth, usuarioLogado, login, register, logout, verify }),
            [loading, auth, usuarioLogado, login, register, logout, verify]
        )

        return (
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        )
    }

    const useAuth = () => useContext(AuthContext)

    export { AuthContext, AuthProvider, useAuth }
