    import { useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import qs from 'qs'
    import { api } from '@/services/api'
    import { useConfirm } from '@/components/ui/confirm-dialog'
    import { KeenIcon } from '@/components/keenicons'
    import { buildRemoveItemsUrl } from '@/utils/urlHelper'
    import { avisoErro, avisoSucesso } from '@/utils/avisos'

    // BOTÃO "Excluir" AO LADO DO ENVIO NO Alterar. A API SÓ MANDA form.delete_button QUANDO O CARTÃO PEDE ($botaoExcluirForm)
    // E O USUÁRIO PODE EXCLUIR ($bloqDel). EXCLUI PELO MESMO acao=remove-items DA LISTAGEM E VOLTA PARA ELA

    //URL DA LISTAGEM: A ATUAL SEM acao/id. O &parametro= QUE SÓ IDENTIFICA ESTE REGISTRO (ex.: lead-123 DOS PROSPECTS DO 360)
    //TAMBÉM SAI; OUTRO &parametro= (CONTEXTO DO MÓDULO PAI) FICA
    const urlDaListagem = (id) => {
        const params = new URLSearchParams(window.location.search)
        params.delete('acao')
        params.delete('id')
        const parametro = params.get('parametro') || ''
        if (parametro !== '' && new RegExp(`(^|\\D)${id}$`).test(parametro)) {
            params.delete('parametro')
        }
        return '?' + params.toString()
    }

    const BotaoExcluirRegistro = () => {

        const navigate                 = useNavigate()
        const [confirm, confirmDialog] = useConfirm()
        const [excluindo, setExcluindo] = useState(false)

        const excluir = async () => {

            const id = new URLSearchParams(window.location.search).get('id')
            if (!id || excluindo) return

            const confirmado = await confirm({
                title: 'Excluir registro?',
                description: 'Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita.',
            })
            if (!confirmado) return

            setExcluindo(true)

            try {

                const response = await api.post(buildRemoveItemsUrl(), qs.stringify({ items: [id] }), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                })

                const resultado = response.data?.success?.response
                if (!resultado || resultado.status === false || resultado.data?.status === false) {
                    throw new Error(resultado?.message || resultado?.data?.message || 'Não foi possível excluir o registro.')
                }

                avisoSucesso(resultado.data?.message || resultado.message || 'Registro excluído com sucesso!')
                navigate(urlDaListagem(id))

            } catch (err) {

                avisoErro(err?.response?.data?.error?.message || err?.message || 'Não foi possível excluir o registro.')
                setExcluindo(false)

            }

        }

        return (
            <>
                <button type="button" className="btn btn-light text-danger" onClick={excluir} disabled={excluindo}>
                    <KeenIcon icon="trash" />
                    {excluindo ? 'Excluindo...' : 'Excluir'}
                </button>
                {confirmDialog}
            </>
        )

    }

    export { BotaoExcluirRegistro }
