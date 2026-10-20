    import qs from 'qs'
    import { useCallback, useLayoutEffect, useRef } from 'react'
    import { arrayMove } from '@dnd-kit/sortable'
    import { api } from '@/services/api'
    import { buildSortListUrl, buildToggleUrl } from '@/utils/urlHelper'
    import { avisoErro, avisoSucesso } from '@/utils/avisos'

    //A RESPOSTA DA PONTE COM status false (OU SEM RESPOSTA) É ERRO MESMO COM HTTP 200
    const respostaDeErro = (resultado) => !resultado || resultado.status === false || resultado.data?.status === false

    // AÇÕES NAS LINHAS DA LISTAGEM: REORDENAR ARRASTANDO E LIGAR/DESLIGAR O STATUS
    const useAcoesDasLinhas = ({ models, visibleModels, setModels, excluindo }) => {

        // REORDENAÇÃO POR ARRASTAR (CARD COM $sequencia = true — A PONTE MANDA params.sequence). A LINHA MUDA DE
        // LUGAR NA HORA E A ORDEM DE TODAS AS LINHAS EM TELA VAI PARA O acao=sort-list, QUE REDISTRIBUI A
        // sequencia ENTRE ELAS (MESMO CRITÉRIO DO PAINEL ANTIGO). SE O SERVIDOR RECUSAR, A ORDEM VOLTA.
        const handleReorder = async (idArrastado, idAlvo) => {

            if (excluindo()) return
            const anterior = visibleModels
            const de       = anterior.findIndex((linha) => String(linha['row-id']) === String(idArrastado))
            const para     = anterior.findIndex((linha) => String(linha['row-id']) === String(idAlvo))

            if (de < 0 || para < 0) return

            const nova = arrayMove(anterior, de, para)
            setModels(nova)

            try {

                const response = await api.post(
                    buildSortListUrl(),
                    qs.stringify({ items: nova.map((linha) => linha['row-id']) }),
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                )

                const resultado = response.data?.success?.response
                if (respostaDeErro(resultado)) {
                    throw new Error(resultado?.message || resultado?.data?.message || '')
                }

            } catch (err) {
                setModels(anterior)
                avisoErro(err?.response?.data?.error?.message || err?.message || 'Não foi possível alterar a sequência')
            }

        }

        //AS LINHAS ATUAIS FICAM NA REF: O handleToggle (E COM ELE AS COLUNAS) NÃO MUDA A CADA LINHA CARREGADA
        const modelsRef = useRef(models)
        useLayoutEffect(() => {
            modelsRef.current = models
        }, [models])

        // HANDLER PARA ATUALIZAR STATUS DO ITEM
        // RECEBE A PRÓPRIA CÉLULA (cell) DO GRID — FUNCIONA EM QUALQUER PÁGINA, SEM DEPENDER
        // DO ESTADO `models`. O VISUAL OTIMISTA/ROLLBACK FICA NO DataRowToggle, QUE LÊ O
        // RETORNO (true/false) DESTA FUNÇÃO.
        const handleToggle = useCallback(async (rowId, colIndex, cell) => {

            const toggleAction = cell?.action || modelsRef.current.find((row) => row['row-id'] === rowId)?.columns?.[colIndex]?.action

            if (!toggleAction) {
                return false
            }

            try {

                const response  = await api.post(buildToggleUrl(toggleAction))
                const resultado = response?.data?.success?.response

                //REDIRECT DO CARTÃO (exit(loc(...)) ANTES DE A PONTE ALTERAR) TAMBÉM CHEGA COM HTTP 200: NADA FOI ALTERADO
                if (respostaDeErro(resultado) || resultado?.data?.redirect || resultado?.redirect) {
                    throw new Error(resultado?.message || resultado?.data?.message || '')
                }

                avisoSucesso(resultado?.data?.message || 'Status alterado com sucesso!')
                return true

            } catch (err) {
                avisoErro(err?.response?.data?.error?.message || err?.message || 'Não foi possível alterar o status deste item')
                return false
            }

        }, [])

        return { handleReorder, handleToggle }

    }

    export { useAcoesDasLinhas }
