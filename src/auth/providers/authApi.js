    import axios from 'axios'
    import * as authHelper from '../_helpers'
    import { getCustomerHost, setCustomerHost } from '@/utils/customerHost'
    import { getApiUrl, setApiUrl, clearApiUrl } from '@/utils/apiUrl'
    import { isSystemNotFoundError, notifySystemNotFound } from '@/utils/systemStatus'

    // CHAMADAS DE AUTENTICAÇÃO DO PAINEL (SEM ESTADO DO REACT) — O AuthProvider SÓ GUARDA O RESULTADO.
    // ANTES DE LOGAR TUDO VAI PARA A API PADRÃO; O LOGIN CENTRAL DEVOLVE A API DO SERVIDOR DO PAINEL (VER utils/apiUrl)

    const CAYMAN_API_URL = import.meta.env.VITE_CAYMAN_API_URL

    const AUTH_MASTER_URL     = `${CAYMAN_API_URL}/auth/master`
    const CAYMAN_REGISTER_URL = `${CAYMAN_API_URL}/panel/signup`
    // SEM RECUPERAÇÃO/TROCA DE SENHA NO PAINEL HOJE (NÃO HÁ ROTA NEM ENDPOINT DE RESET)
    // const FORGOT_PASSWORD_URL = `${CAYMAN_API_URL}/panel/forgot-password`
    // const RESET_PASSWORD_URL  = `${API_URL}/reset-password`

    const JSON_DO_CLIENTE = () => ({
        'Content-Type': 'application/json',
        'Customer-Host': getCustomerHost(),
    })

    //?hash= NA URL DE ENTRADA (ACESSO DE SUPORTE ABERTO PELO PAINEL MESTRE)
    export const hashDaUrl = () => new URLSearchParams(window.location.search).get('hash')

    //&servidor= DO "Acessar Painel" (br-1 / us-1): O HASH FOI GRAVADO NO auth_session DAQUELE SERVIDOR, ENTÃO O
    //panel/login-hash E A SESSÃO SEGUINTE VÃO PARA A API DELE. SÓ O FORMATO xx-N (A URL SAI DE apiUrl COM A LISTA BRANCA)
    const apiDoServidorDaUrl = () => {
        const servidor = new URLSearchParams(window.location.search).get('servidor') || ''
        return /^[a-z]{2}-\d+$/.test(servidor) ? `https://api.${servidor}.wezy.com.br/api/v1` : null
    }

    //O HASH NÃO FICA NA URL NEM NO HISTÓRICO
    const tirarHashDaUrl = () => {
        const params = new URLSearchParams(window.location.search)
        params.delete('hash')
        params.delete('servidor')
        const query = params.toString()
        window.history.replaceState(window.history.state, '', window.location.pathname + (query ? '?' + query : ''))
    }

    //GRAVA (OU APAGA, COM undefined) A SESSÃO NO localStorage
    export const gravarSessao = (auth) => {

        if (!auth) {
            authHelper.removeAuth()
            return
        }

        authHelper.setAuth(auth)

        // Auth centralizada (/auth/master) ou formato antigo do webservice
        const sessionToken = auth.data?.session_token ?? auth.success?.response?.data?.session_token

        if (sessionToken) {
            authHelper.setLocalAuth(sessionToken)
        }

    }

    //SESSÃO DO panel/login E DO panel/login-hash: O DOMÍNIO DEVOLVIDO PELA API PASSA A SER O Customer-Host. O LOGIN FOI NA
    //API PADRÃO, ENTÃO A SESSÃO É DELA (ESQUECE A API DE UM LOGIN CENTRAL ANTERIOR)
    const sessaoDoPainel = (resposta, mensagemSemToken, apiDoServidor = null) => {
        const dados = resposta?.success?.response?.data
        if (!dados?.session_token) throw new Error(mensagemSemToken)
        //ACESSO POR HASH DE OUTRO SERVIDOR (&servidor=us-1): A SESSÃO É DA API DELE
        if (apiDoServidor) setApiUrl(apiDoServidor)
        else clearApiUrl()
        if (dados.dominio) setCustomerHost(dados.dominio)
        return { status: true, data: dados }
    }

    const avisarSistemaForaDoAr = (error) => {
        if (isSystemNotFoundError(error)) notifySystemNotFound()
    }

    //ACESSO DE SUPORTE ABERTO PELO PAINEL MESTRE (?hash=...&a=dominio). O FRONT SÓ REPASSA O HASH:
    //A API (panel/login-hash) CONFERE VALIDADE, CLIENTE E USO ÚNICO E DEVOLVE O TOKEN DE SESSÃO
    export const entrarPorHash = async (hash) => {

        const apiDoServidor = apiDoServidorDaUrl()
        tirarHashDaUrl()

        try {
            const { data: resposta } = await axios.post(`${apiDoServidor || CAYMAN_API_URL}/panel/login-hash`, { hash }, { headers: JSON_DO_CLIENTE() })
            return sessaoDoPainel(resposta, 'Acesso inválido ou expirado.', apiDoServidor)
        } catch (error) {
            avisarSistemaForaDoAr(error)
            //SEM ISSO CAI NO LOGIN SEM EXPLICAÇÃO (ex.: 403 api_disabled — O PAINEL REACT EXIGE API ATIVA NO CLIENTE)
            throw new Error(error.response?.data?.error?.message || error.message || 'Acesso inválido ou expirado.')
        }

    }

    /**
     * Autentica na API centralizada (/auth/master) do domínio pai.
     *
     * Quando o mesmo login/senha existe em mais de um painel, a API
     * responde 409 com a lista de painéis; nesse caso é lançado um erro
     * com `code = 'MULTIPLE_PANELS'` e `paineis`, para a tela de login
     * exibir a escolha e reenviar com o painel escolhido ({ id_painel_cliente, host } de um item de `paineis`).
     */
    export const entrarNoCentral = async (login, senha, painelEscolhido = null) => {

        try {

            const { data: auth } = await axios.post(
                AUTH_MASTER_URL,
                {
                    email: login,
                    senha: senha,
                    //host: O MESMO id_painel_cliente PODE EXISTIR NOS DOIS SERVIDORES (br-1 / us-1)
                    ...(painelEscolhido ? { id_painel_cliente: painelEscolhido.id_painel_cliente, host: painelEscolhido.host } : {}),
                },
                { headers: { 'Content-Type': 'application/json' } }
            )

            if (!auth?.status || !auth?.data?.session_token) {
                throw new Error(auth?.message || 'E-mail ou senha inválidos.')
            }

            // As demais APIs do painel resolvem o cliente pelo host,
            // então o domínio retornado passa a ser o Customer-Host
            setCustomerHost(auth.data.dominio)

            // E vão para a API do servidor do painel (br-1 / us-1)
            setApiUrl(auth.data.api_url)

            return auth

        } catch (error) {

            const response = error.response

            if (response?.status === 409 && Array.isArray(response.data?.paineis)) {
                const choiceError = new Error(response.data.message)
                choiceError.code = 'MULTIPLE_PANELS'
                choiceError.paineis = response.data.paineis
                throw choiceError
            }

            avisarSistemaForaDoAr(error)

            throw new Error(response?.data?.message || error.message || 'Não foi possível autenticar. Tente novamente.')

        }

    }

    /**
     * Login no painel de um cliente só (panel/login com o Customer-Host do ?a=): o usuário precisa
     * existir naquele painel, não no cadastro central. Só pelo e-mail (o legado continua pelo login).
     */
    export const entrarNoPainel = async (email, senha) => {

        try {
            const { data: resposta } = await axios.post(`${CAYMAN_API_URL}/panel/login`, { email, senha }, { headers: JSON_DO_CLIENTE() })
            return sessaoDoPainel(resposta, 'E-mail ou senha inválidos.')
        } catch (error) {
            avisarSistemaForaDoAr(error)
            throw new Error(error.response?.data?.error?.message || error.message || 'Não foi possível autenticar. Tente novamente.')
        }

    }

    //CADASTRO NO PAINEL DO CLIENTE (panel/signup, LIBERADO PELO "Habilitar cadastro de usuários" DO CLIENTE)
    export const cadastrar = async (name, login, email, password, password_confirmation) => {

        try {

            const { data: auth } = await axios.post(
                CAYMAN_REGISTER_URL,
                {
                    nome: name,
                    login,
                    email,
                    senha: password,
                    'confirmacao-senha': password_confirmation,
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

            return auth

        } catch (error) {
            avisarSistemaForaDoAr(error)
            throw new Error(error.response?.data?.error?.message)
        }

    }

    //"Habilitar cadastro de usuários" DO CLIENTE (panel/login-config) — SÓ FAZ SENTIDO NO PAINEL DE UM CLIENTE
    export const cadastroLiberadoNoCliente = async () => {
        const { data } = await axios.get(`${CAYMAN_API_URL}/panel/login-config`, {
            headers: { 'Customer-Host': getCustomerHost() },
        })
        return data?.success?.response?.data?.cadastro === true
    }

    //INVALIDA O TOKEN NA API (panel/logout) SEM ESPERAR A RESPOSTA — SE JÁ EXPIROU, O 401 É IGNORADO
    export const encerrarSessaoNaApi = () => {

        const token = authHelper.getAuthToken()
        if (!token) return

        axios
            .post(`${getApiUrl()}/panel/logout`, {}, {
                headers: { ...JSON_DO_CLIENTE(), Authorization: `Bearer ${token}` },
            })
            .catch(() => {})

    }

    //DADOS DO USUÁRIO LOGADO — VÊM DO PRÓPRIO /auth/master (data.usuario),
    //QUE JÁ FICA SALVO NO localStorage. NÃO EXIGE REQUISIÇÃO EXTRA.
    //DEPOIS DE RECARREGAR A PÁGINA O auth É SÓ O TOKEN (getAuthToken), ENTÃO O usuario
    //VEM DA RESPOSTA COMPLETA GUARDADA — ANTES O NOME E O LOGIN SUMIAM DO MENU DO USUÁRIO
    export const usuarioDaSessao = (auth) => {

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

    }
