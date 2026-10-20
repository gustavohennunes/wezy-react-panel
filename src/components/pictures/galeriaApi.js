    import { toast } from 'sonner'
    import { api } from '@/services/api'
    import { buildApiUrl } from '@/utils/urlHelper'

    // ROTAS DA GALERIA (AS MESMAS DO framework/fotos.php NO LEGADO), SEMPRE A PARTIR DA URL ATUAL:
    //   ENVIO     → POST NA URL ATUAL COM FrmFoto[] + Enviar=ok (E FrmLink / FrmLegenda QUANDO O CARTÃO PEDE)
    //   EXCLUSÃO  → GET NA URL ATUAL COM excluir=id|id
    //   ORDEM     → GET acao=arrumaListagem&lista=|id|id (actionSortGallery)

    const dadosDaResposta = (response) => response?.data?.success?.response?.data

    export const mensagemErro = (texto) => toast.error(texto || 'Não foi possível concluir a operação.')

    //GALERIA ATUAL (params.photos) SEM O LOADER DE TELA INTEIRA DO callApi; null = A RESPOSTA NÃO TROUXE A GALERIA
    export const carregarGaleria = async () => {
        const response = await api.get(buildApiUrl(window.location.search))
        return dadosDaResposta(response)?.params?.photos || null
    }

    //DEVOLVE A GALERIA ATUALIZADA QUANDO O fotos.php A MANDA NA RESPOSTA (COM A MENSAGEM DO ENVIO)
    export const enviarFotos = async ({ arquivos, link, legenda, comLink, comLegenda }) => {

        const dados = new FormData()
        arquivos.forEach((arquivo) => dados.append('FrmFoto[]', arquivo))
        dados.append('Enviar', 'ok')
        if (comLink) dados.append('FrmLink', link)
        if (comLegenda) dados.append('FrmLegenda', legenda)

        const response = await api.post(buildApiUrl(window.location.search), dados, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })

        return dadosDaResposta(response)?.params?.photos || null

    }

    export const salvarOrdemDasFotos = (ids) => {
        const params = new URLSearchParams(window.location.search)
        const consulta = new URLSearchParams({
            pag: params.get('pag') || params.get('slug') || '',
            acao: 'arrumaListagem',
            lista: '|' + ids.join('|'),
        })
        return api.get(buildApiUrl('?' + consulta.toString()))
    }

    //O fotos.php RESPONDE COM O REDIRECT DO LEGADO (…&exc=ok / exc=erro). DEVOLVE 'ok', 'erro' OU null (SEM RETORNO)
    export const excluirFotos = async (ids) => {

        const params = new URLSearchParams(window.location.search)
        params.set('excluir', ids.join('|'))

        const response = await api.get(buildApiUrl('?' + params.toString()), { responseType: 'text' })
        const retorno  = typeof response?.data === 'string' ? response.data : JSON.stringify(response?.data ?? '')

        if (/exc=ok/.test(retorno)) return 'ok'
        if (/exc=/.test(retorno)) return 'erro'
        return null

    }
