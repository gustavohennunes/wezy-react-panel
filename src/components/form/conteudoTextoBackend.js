//A TROCA DE MODO LEVA O CONTEUDO ATUAL PARA O OUTRO CAMPO, INCLUINDO LABEL, TITLE E URL DOS LINKS.
export const atualizarConteudoTextoBackend = (estado, nome, valor) => {
    const proximo = { ...estado, [nome]: valor }
    const pares = [
        ['TxtContent', 'TxtDinamic_content'],
        ['FrmContent', 'FrmDinamic_content'],
        ['FrmContent_title', 'FrmDinamic_content_title'],
        ['FrmContent_url', 'FrmDinamic_content_url'],
    ].filter((par) => par.every((campo) => Object.hasOwn(estado, campo)))

    for (const [fixo, dinamico] of pares) {
        if (nome === fixo || nome === dinamico) {
            proximo[fixo] = valor
            proximo[dinamico] = valor
        }

        if (nome === 'RdoModo' && String(valor) !== String(estado.RdoModo) && ['0', '1'].includes(String(valor))) {
            const anterior = String(estado.RdoModo) === '1' ? dinamico : fixo
            proximo[fixo] = estado[anterior] ?? ''
            proximo[dinamico] = estado[anterior] ?? ''
        }
    }

    return proximo
}
