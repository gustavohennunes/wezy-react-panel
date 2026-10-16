// REMOVE DO window UMA FUNÇÃO QUE O REACT EXPÔS PARA O HTML LEGADO (href="Javascript:funcao();").
// O delete PODE FALHAR: SE UM <script> DO CARTÃO DECLAROU "function nome(){}" NO ESCOPO GLOBAL, A PROPRIEDADE
// FICA NÃO-REMOVÍVEL E, EM MÓDULO (strict mode), O delete LANÇA TypeError — DERRUBANDO A DESMONTAGEM DA TELA.
// NESSE CASO SÓ ZERA O VALOR. valor: SÓ LIMPA SE AINDA FOR A FUNÇÃO QUE O REACT COLOCOU
export const limparGlobal = (nome, valor) => {
    if (valor !== undefined && window[nome] !== valor) return
    try {
        delete window[nome]
    } catch {
        try {
            window[nome] = undefined
        } catch {
            //SOMENTE LEITURA: IGNORA
        }
    }
}
