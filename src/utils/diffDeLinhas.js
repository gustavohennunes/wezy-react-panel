// DIFF DE LINHAS (ESTILO git diff) ENTRE DOIS TEXTOS: [{ tipo: 'igual' | 'removida' | 'adicionada', texto, antes, depois }]
// antes/depois = NÚMERO DA LINHA EM CADA LADO (null NO LADO EM QUE ELA NÃO EXISTE). LCS NO MIOLO, DEPOIS DE TIRAR O
// COMEÇO E O FIM IGUAIS — EDITAR UM TRECHO DE UM ARQUIVO GRANDE CONTINUA BARATO. MIOLO GIGANTE (> LIMITE DE CÉLULAS)
// VIRA "TUDO REMOVIDO + TUDO ADICIONADO" EM VEZ DE TRAVAR A ABA

const LIMITE_DE_CELULAS = 4_000_000

const linhasDe = (texto) => (texto === '' ? [] : String(texto).replace(/\r\n?/g, '\n').split('\n'))

export const diffDeLinhas = (textoAntes, textoDepois) => {

    const a = linhasDe(textoAntes)
    const b = linhasDe(textoDepois)

    let inicio = 0
    while (inicio < a.length && inicio < b.length && a[inicio] === b[inicio]) inicio++

    let fimA = a.length
    let fimB = b.length
    while (fimA > inicio && fimB > inicio && a[fimA - 1] === b[fimB - 1]) {
        fimA--
        fimB--
    }

    const resultado = []
    const igual     = (i, j) => resultado.push({ tipo: 'igual', texto: a[i], antes: i + 1, depois: j + 1 })
    const removida  = (i) => resultado.push({ tipo: 'removida', texto: a[i], antes: i + 1, depois: null })
    const adicionada = (j) => resultado.push({ tipo: 'adicionada', texto: b[j], antes: null, depois: j + 1 })

    for (let i = 0; i < inicio; i++) igual(i, i)

    const n = fimA - inicio
    const m = fimB - inicio

    if (n * m > LIMITE_DE_CELULAS) {

        for (let i = inicio; i < fimA; i++) removida(i)
        for (let j = inicio; j < fimB; j++) adicionada(j)

    } else {

        //TABELA DO LCS DE TRÁS PARA FRENTE: tabela[i][j] = MAIOR SUBSEQUÊNCIA COMUM DE a[inicio+i..] E b[inicio+j..]
        const largura = m + 1
        const tabela  = new Uint32Array((n + 1) * largura)
        for (let i = n - 1; i >= 0; i--) {
            for (let j = m - 1; j >= 0; j--) {
                tabela[i * largura + j] = a[inicio + i] === b[inicio + j]
                    ? tabela[(i + 1) * largura + j + 1] + 1
                    : Math.max(tabela[(i + 1) * largura + j], tabela[i * largura + j + 1])
            }
        }

        let i = 0
        let j = 0
        while (i < n && j < m) {
            if (a[inicio + i] === b[inicio + j]) {
                igual(inicio + i, inicio + j)
                i++
                j++
            } else if (tabela[(i + 1) * largura + j] >= tabela[i * largura + j + 1]) {
                removida(inicio + i)
                i++
            } else {
                adicionada(inicio + j)
                j++
            }
        }
        for (; i < n; i++) removida(inicio + i)
        for (; j < m; j++) adicionada(inicio + j)

    }

    for (let k = 0; k < a.length - fimA; k++) igual(fimA + k, fimB + k)

    return resultado

}

// SÓ AS ALTERAÇÕES COM contexto LINHAS IGUAIS EM VOLTA; OS TRECHOS IGUAIS QUE SOBRAM VIRAM { tipo: 'oculto', quantidade }
export const comContexto = (linhas, contexto = 3) => {

    const perto = new Array(linhas.length).fill(false)
    linhas.forEach((linha, indice) => {
        if (linha.tipo === 'igual') return
        for (let k = Math.max(0, indice - contexto); k <= Math.min(linhas.length - 1, indice + contexto); k++) perto[k] = true
    })

    const resultado = []
    let ocultas = 0
    linhas.forEach((linha, indice) => {
        if (perto[indice]) {
            if (ocultas > 0) resultado.push({ tipo: 'oculto', quantidade: ocultas })
            ocultas = 0
            resultado.push(linha)
        } else {
            ocultas++
        }
    })
    if (ocultas > 0) resultado.push({ tipo: 'oculto', quantidade: ocultas })

    return resultado

}
