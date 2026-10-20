    import qs from 'qs'
    import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
    import { api } from '@/services/api'
    import { buildRemoveItemsUrl } from '@/utils/urlHelper'
    import { avisoErro, avisoSucesso } from '@/utils/avisos'

    const SEM_REMOCOES = new Set()

    // EXCLUSÃO DE LINHAS DA LISTAGEM: REMOVE DA TELA APÓS CONFIRMAR E ENVIA POR AJAX, SEM RECARREGAR O MÓDULO.
    // AS REMOÇÕES VALEM SÓ PARA A LISTAGEM ATUAL (scope): OUTRA RESPOSTA DA PONTE RECOMEÇA DO ZERO
    const useRemocaoDeItens = ({ scope, confirm, setSelectedRows }) => {

        const deletionBusy   = useRef(false)
        const selectionTable = useRef(null)
        const currentScope   = useRef(scope)
        useLayoutEffect(() => {
            currentScope.current = scope
        }, [scope])

        const [removals, setRemovals] = useState({ scope, ids: SEM_REMOCOES })
        const removedIds = useMemo(() => (removals.scope === scope ? removals.ids : SEM_REMOCOES), [removals, scope])

        const removeItems = useCallback(async (items, legacyRow = null) => {

            const ids = [...new Set(items.map(String))]
            if (ids.length === 0 || deletionBusy.current || currentScope.current !== scope) return
            deletionBusy.current = true

            try {

                const url = buildRemoveItemsUrl()
                const confirmado = await confirm({
                    title: ids.length === 1 ? 'Excluir item?' : `Excluir ${ids.length} itens?`,
                    description: ids.length === 1
                        ? 'Tem certeza que deseja excluir este item? Essa ação não pode ser desfeita.'
                        : `Tem certeza que deseja excluir os ${ids.length} itens selecionados? Essa ação não pode ser desfeita.`,
                })
                if (!confirmado || currentScope.current !== scope) return

                const removidos = new Set(ids)
                const previousHidden = legacyRow?.hidden
                if (legacyRow) legacyRow.hidden = true
                else setRemovals((prev) => ({
                    scope,
                    ids: new Set([...(prev.scope === scope ? prev.ids : []), ...ids]),
                }))
                selectionTable.current?.setRowSelection((selection) => Object.fromEntries(
                    Object.entries(selection).filter(([id]) => !removidos.has(String(id)))
                ))
                setSelectedRows((prev) => prev.filter((id) => !removidos.has(String(id))))

                try {
                    const response = await api.post(url, qs.stringify({ items: ids }), {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    })
                    const resultado = response.data?.success?.response
                    if (!resultado || resultado.status === false || resultado.data?.status === false) {
                        throw new Error(resultado?.message || resultado?.data?.message || 'Não foi possível excluir os itens')
                    }
                    avisoSucesso(resultado.data?.message || resultado.message || 'Exclusão concluída com sucesso!')
                } catch (err) {
                    if (legacyRow) legacyRow.hidden = previousHidden
                    else setRemovals((prev) => prev.scope !== scope ? prev : ({
                        scope,
                        ids: new Set([...prev.ids].filter((id) => !removidos.has(id))),
                    }))
                    avisoErro(err?.response?.data?.error?.message || err?.message || 'Não foi possível excluir os itens')
                }

            } finally {
                deletionBusy.current = false
            }

        }, [confirm, scope, setSelectedRows])

        //A REORDENAÇÃO ESPERA A EXCLUSÃO TERMINAR (A ORDEM ENVIADA NÃO PODE INCLUIR UMA LINHA SAINDO)
        const excluindo = useCallback(() => deletionBusy.current, [])

        return { removedIds, removeItems, selectionTable, excluindo }

    }

    export { useRemocaoDeItens }
