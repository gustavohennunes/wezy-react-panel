    import { useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { api } from '@/services/api'
    import { avisoErro, avisoSucesso } from '@/utils/avisos'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { usePageData } from '@/context/PageDataContext'
    import { useAuth } from '@/auth/providers/JWTProvider'
    import { findLegacyRedirectDeep, applyLegacyRedirect } from '@/utils/legacyRedirect'
    import { arquivosRemovidos } from './arquivosRemovidos'

    //Ctrl+S: O JS DOS CARTÕES (ex.: ABA Geral DA SECTION) FAZ $("form").submit() NO ATALHO. NO PAINEL REACT O ATALHO SÓ SALVA,
    //SEM REDIRECT NEM RECARREGAR O FORMULÁRIO — ISSO FICA PARA O BOTÃO "Salvar". GUARDA A HORA DO ÚLTIMO Ctrl+S PARA O
    //envio SABER DE ONDE VEIO
    let ultimoAtalhoSalvar = 0
    if (typeof document !== 'undefined') {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 's') ultimoAtalhoSalvar = Date.now()
        }, true)
    }

    const salvoPeloAtalho = () => Date.now() - ultimoAtalhoSalvar < 2000

    //"Remover" DO FormFile: del<campo>=ok E O CAMPO DE ARQUIVO VAZIO (O fotoInsert SÓ OLHA OS CAMPOS QUE CHEGAM EM
    //$_FILES). VEM DAQUI E NÃO DO INPUT PORQUE A LINHA PODE TER SIDO ESCONDIDA (data-valid-*) ANTES DE SALVAR
    const dadosDoFormulario = (form) => {
        const formData = new FormData(form)
        arquivosRemovidos.forEach((campo) => {
            formData.set('del' + campo, 'ok')
            if (!formData.has(campo)) formData.append(campo, new Blob([]), '')
        })
        arquivosRemovidos.clear()
        return formData
    }

    //REDIRECT DO CARTÃO DEPOIS DE SALVAR: <script>window.location="..."</script> NA RESPOSTA BRUTA (COM exit(loc(...)) O PHP
    //DEVOLVE HTML CRU, SEM O JSON) OU O redirect DECLARADO PELA PONTE (URL NO FORMATO LEGADO index.php?pag=...)
    const redirecionouPeloCartao = (resposta, navigate) => {
        const redirectLegado = findLegacyRedirectDeep(resposta?.data)
        if (redirectLegado && applyLegacyRedirect(redirectLegado, navigate)) return true
        const redirect = resposta?.data?.success?.response?.data?.redirect
        return Boolean(redirect) && applyLegacyRedirect(redirect, navigate)
    }

    // ENVIO DO FORMULÁRIO DO CARTÃO PARA A PONTE (MESMA URL DA TELA) E O QUE ACONTECE DEPOIS DE SALVAR
    const useEnvioDoFormulario = () => {

        const navigate        = useNavigate()
        const { callApi }     = usePageData()
        const { logout }      = useAuth()
        const [ loading, setLoading ] = useState(false)

        //DEPOIS DE SALVAR SEM REDIRECT DO CARTÃO
        //PAINEL ANTIGO (framework/formulario.php): DEPOIS DE ALTERAR, VOLTA PARA O MESMO FORMULÁRIO; DEPOIS DE INSERIR, FICA NO
        //acao=Inserir COM O FORMULÁRIO LIMPO PARA CADASTRAR OUTRO (ANTES O INSERIR VOLTAVA PARA A LISTAGEM). O RECARREGAMENTO
        //PASSA PELO ScreenLoader, QUE DESMONTA O FORMULÁRIO — POR ISSO O INSERIR VOLTA VAZIO. PÁGINA SÓ DE FORMULÁRIO (SEM acao)
        //TAMBÉM RECARREGA
        const seguirDepoisDeSalvar = (params) => {

            callApi(buildApiUrl(params))

        }

        const submitForm = async (e) => {

            e.preventDefault()

            const params   = new URLSearchParams(window.location.search)
            const formData = dadosDoFormulario(e.target)

            setLoading(true)

            try {

                const response = await api.post(buildApiUrl(window.location.search), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })

                const mensagem = response?.data?.success?.response?.data?.message

                //SALVO PELO Ctrl+S (VER ultimoAtalhoSalvar): FICA NA TELA, SÓ AVISA
                if (params.get('acao') === 'Alterar' && salvoPeloAtalho()) {
                    avisoSucesso(mensagem || 'Registro alterado com sucesso')
                    return
                }

                if (redirecionouPeloCartao(response, navigate)) return

                seguirDepoisDeSalvar(params)
                avisoSucesso(mensagem)

                //CASO ESTEJA NA FINALIZAÇÃO DE CADASTRO, DIRECIONA PARA O DASHBOARD
                const slug = params.get('slug') ?? params.get('pag') ?? ''
                if (slug === 'perfil' && params.get('action') === 'finalizar-cadastro') {
                    window.location.href = '/'
                }

            } catch (error) {

                avisoErro(error.response?.data?.error?.message || error.message)

                if (error.status == 401) {
                    logout()
                }

            } finally {
                //SAI DO ESTADO DE ENVIO EM QUALQUER CAMINHO (SUCESSO, ERRO, REDIRECT OU EXCEÇÃO INESPERADA)
                setLoading(false)
            }

        }

        return { submitForm, loading }

    }

    export { useEnvioDoFormulario }
