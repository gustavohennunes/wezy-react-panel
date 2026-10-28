// URL DE CADA POSIÇÃO DO HISTÓRICO DO NAVEGADOR (idx QUE O BrowserRouter GRAVA NO history.state), PARA O "Voltar" TER UM
// href DE VERDADE: O BOTÃO DO MEIO / CTRL+CLIQUE ABREM A PÁGINA ANTERIOR NUMA ABA NOVA. FICA NO sessionStorage (É POR ABA E
// SOBREVIVE AO F5). O AppRouting REGISTRA A CADA TROCA DE ROTA

const CHAVE = 'wezy-urls-do-historico'
const MANTER = 100

const ler = () => {
    try {
        return JSON.parse(sessionStorage.getItem(CHAVE)) || {}
    } catch {
        return {}
    }
}

const idxAtual = () => {
    const idx = window.history.state?.idx
    return typeof idx === 'number' ? idx : null
}

export const registraUrlDoHistorico = () => {

    const idx = idxAtual()
    if (idx === null) return

    const mapa = ler()
    mapa[idx] = window.location.pathname + window.location.search

    //SÓ AS ÚLTIMAS POSIÇÕES: O SESSION STORAGE NÃO CRESCE SEM LIMITE NUMA ABA ABERTA O DIA TODO
    Object.keys(mapa).forEach((chave) => {
        if (Number(chave) < idx - MANTER) delete mapa[chave]
    })

    try {
        sessionStorage.setItem(CHAVE, JSON.stringify(mapa))
    } catch {
        //SEM sessionStorage (ABA PRIVADA BLOQUEADA): O "Voltar" CAI NO href RESERVA
    }

}

//URL DA PÁGINA ANTERIOR NESTA ABA, OU null QUANDO ESTA É A PRIMEIRA (ABRIU DIRETO PELO LINK)
export const urlAnterior = () => {
    const idx = idxAtual()
    return idx && idx > 0 ? ler()[idx - 1] || null : null
}
