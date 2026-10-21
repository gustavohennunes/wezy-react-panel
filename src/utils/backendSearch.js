import { contemTodasAsPalavras } from './textSearch'
import { destacarBuscaHtml } from './destacarBuscaHtml'

export const filtrarBackendsHtml = (html, busca) => {
    if (!busca.trim()) return html
    const doc = new DOMParser().parseFromString('<table><tbody>' + html + '</tbody></table>', 'text/html')
    const body = doc.querySelector('tbody')
    const linhas = Array.from(body.rows)
    const colunas = linhas[0]?.cells.length || 1
    let encontrados = 0
    for (const linha of linhas) {
        const texto = Array.from(linha.cells).slice(0, -1).map((cell) => cell.textContent).join(' ')
        if (contemTodasAsPalavras(texto, busca)) encontrados++
        else linha.remove()
    }
    if (!encontrados) {
        const celula = body.insertRow().insertCell()
        celula.colSpan = colunas
        celula.className = 'text-center py-5 text-gray-600'
        celula.textContent = 'Nenhum backend encontrado.'
    }
    return destacarBuscaHtml(body.innerHTML, busca, 'tbody')
}
