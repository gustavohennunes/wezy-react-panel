import { isLegacyUrl } from '@/utils/legacyBridge'
import { cleanUrl } from '@/utils/urlHelper'

// CLIQUE DENTRO DE HTML DO CARTÃO (CÉLULA DA LISTAGEM, LISTAGEM MONTADA EM HTML): LINK ?pag=... NAVEGA PELO ROUTER, SEM
// RECARREGAR O PAINEL INTEIRO. LINK COM &excluir=id (aoExcluir) VAI PARA A EXCLUSÃO DO REACT (CONFIRMAÇÃO + AJAX).
// FICA NO onClick DO REACT NO CONTAINER (DELEGAÇÃO): O TECLADO JÁ CHEGA AQUI (Enter NUM LINK DISPARA click), E OS
// onClick DOS FILHOS (ex.: AÇÕES DO DataRowActionsMenu EM PORTAL) RODAM ANTES E PODEM CANCELAR COM preventDefault
export const tratarCliqueEmLinkDoLegado = (event, navigate, aoExcluir = null) => {

    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const link = event.target.closest?.('a[href]')
    if (!link || (link.target && link.target !== '_self')) return

    const href = link.getAttribute('href') || ''

    if (aoExcluir) {
        const params = new URL(href, window.location.href).searchParams
        if (params.has('excluir')) {
            event.preventDefault()
            event.stopPropagation()
            aoExcluir([params.get('excluir')])
            return
        }
    }

    if (!isLegacyUrl(href)) return

    event.preventDefault()
    const destino = cleanUrl(href)
    navigate(destino.startsWith('?') || destino.startsWith('/') ? destino : '/' + destino)

}
