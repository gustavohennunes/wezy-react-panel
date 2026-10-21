//O BACKEND TEM DOIS CAMPOS PARA O MESMO TEXTO. A TROCA DE MODO LEVA A EDICAO ATUAL PARA O OUTRO CAMPO.
export const atualizarConteudoTextoBackend = (estado, nome, valor) => {
    const proximo = { ...estado, [nome]: valor }

    if (nome === 'TxtContent' || nome === 'TxtDinamic_content') {
        return { ...proximo, TxtContent: valor, TxtDinamic_content: valor }
    }

    if (nome === 'RdoModo' && String(valor) !== String(estado.RdoModo) && ['0', '1'].includes(String(valor))) {
        const anterior = String(estado.RdoModo) === '1' ? 'TxtDinamic_content' : 'TxtContent'
        const texto = estado[anterior] ?? ''
        return { ...proximo, TxtContent: texto, TxtDinamic_content: texto }
    }

    return proximo
}
