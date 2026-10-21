import { normalizarBusca } from './normalizarBusca'

export const escaparHtml = (texto) => String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Marca somente texto visível; preserva links, atributos e controles do legado.
export const destacarBuscaHtml = (html, busca, contexto = 'body') => {
    if (!busca?.trim() || typeof html !== 'string') return html
    const doc = new DOMParser().parseFromString(contexto === 'tbody' ? '<table><tbody>' + html + '</tbody></table>' : html, 'text/html')
    const raiz = doc.querySelector(contexto)
    const palavras = normalizarBusca(busca).split(/\s+/).filter(Boolean).sort((a, b) => b.length - a.length)
    const walker = doc.createTreeWalker(raiz, NodeFilter.SHOW_TEXT)
    const nos = []
    while (walker.nextNode()) nos.push(walker.currentNode)
    for (const no of nos) {
        if (no.parentElement.closest('script,style,textarea,select,button,mark')) continue
        const texto = no.textContent
        const normalizado = normalizarBusca(texto)
        const fragmento = doc.createDocumentFragment()
        let inicio = 0
        let cursor = 0
        while (cursor < texto.length) {
            const palavra = palavras.find((parte) => normalizado.startsWith(parte, cursor))
            if (!palavra) { cursor++; continue }
            fragmento.append(texto.slice(inicio, cursor))
            const marca = doc.createElement('mark')
            marca.className = 'editor-tree-busca'
            marca.textContent = texto.slice(cursor, cursor + palavra.length)
            fragmento.append(marca)
            cursor += palavra.length
            inicio = cursor
        }
        if (inicio > 0) {
            fragmento.append(texto.slice(inicio))
            no.replaceWith(fragmento)
        }
    }
    return raiz.innerHTML
}
