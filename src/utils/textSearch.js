    // BUSCA DE TEXTO NO ESTILO DO customMatcher DO select2 DO PAINEL ANTIGO:
    // TODAS AS PALAVRAS DIGITADAS PRECISAM APARECER, EM QUALQUER ORDEM, SEM DIFERENCIAR ACENTOS/CAIXA

    export const normalizaTexto = (texto) =>
        String(texto ?? '')
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .toUpperCase()

    export const contemTodasAsPalavras = (texto, busca) => {

        const alvo     = normalizaTexto(texto)
        const palavras = normalizaTexto(busca).split(' ').filter(Boolean)

        return palavras.every((palavra) => alvo.includes(palavra))

    }

    //TEXTO VISÍVEL DE UM TRECHO DE HTML. DOMParser NÃO EXECUTA SCRIPT NEM CARREGA IMAGEM
    //(DIFERENTE DE innerHTML EM UM ELEMENTO, ONDE <img onerror> DISPARA)
    const parser = typeof DOMParser !== 'undefined' ? new DOMParser() : null

    export const textoDoHtml = (html) => {

        if (typeof html !== 'string' || html === '') return ''
        if (!html.includes('<') && !html.includes('&')) return html

        return parser ? parser.parseFromString(html, 'text/html').body.textContent || '' : html.replace(/<[^>]*>/g, ' ')

    }
