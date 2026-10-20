    // CHAVE ESTÁVEL PARA LISTAS QUE A PONTE MANDA SEM id (ABAS, BOTÕES, AÇÕES, MENSAGENS): O PRÓPRIO CONTEÚDO DO ITEM.
    // ITENS REPETIDOS GANHAM UM SUFIXO (#1, #2...) NA ORDEM EM QUE APARECEM. DIFERENTE DO ÍNDICE, A CHAVE ACOMPANHA O
    // ITEM QUANDO A LISTA MUDA (UMA ABA A MAIS NO COMEÇO NÃO FAZ O REACT REAPROVEITAR O ELEMENTO DA ABA ERRADA)
    export const comChaves = (itens, base) => {

        const vistos = new Map()

        return (Array.isArray(itens) ? itens : []).map((item) => {
            const chave = String(base(item) ?? '')
            const repeticoes = vistos.get(chave) || 0
            vistos.set(chave, repeticoes + 1)
            return { item, chave: repeticoes ? `${chave}#${repeticoes}` : chave }
        })

    }
