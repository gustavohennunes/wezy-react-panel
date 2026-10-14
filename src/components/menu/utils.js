import { Children, isValidElement } from 'react'
import { MenuLink } from './MenuLink'
import { matchPath } from 'react-router'
export const getMenuLinkPath = (children) => {
    let path = ''
    Children.forEach(children, (child) => {
        if (
            isValidElement(child) &&
            child.type === MenuLink &&
            child.props.path
        ) {
            path = child.props.path // Assign the path when found
        }
    })
    return path
}
//MÓDULO DA URL DO PAINEL: AS PÁGINAS SÃO TODAS "/" E O QUE MUDA É O ?pag= (OU ?slug=)
export const moduloDaUrl = (search) => {
    const params = new URLSearchParams(search)
    return params.get('pag') ?? params.get('slug') ?? ''
}

//O LINK DO MENU APONTA PARA A PÁGINA ATUAL? LINKS COM QUERY (ex.: "?pag=fontes") CASAM PELO MÓDULO —
//ASSIM "?pag=fontes&acao=Alterar&id=1" CONTINUA DESTACANDO "Fontes". LINKS SEM QUERY USAM O
//matchPath DO PATHNAME, COMO O TEMPLATE FAZIA.
export const menuPathMatches = (itemPath, location) => {
    if (!itemPath) return false
    if (itemPath.includes('?')) {
        const alvo = new URL(itemPath, 'http://painel.local/')
        if (alvo.pathname !== location.pathname) return false
        const moduloAlvo = moduloDaUrl(alvo.search)
        return moduloAlvo ? moduloAlvo === moduloDaUrl(location.search) : alvo.search === location.search
    }
    if (location.pathname === '/') {
        return itemPath === '/'
    }
    return Boolean(matchPath(itemPath, location.pathname))
}

//ALGUM LINK DENTRO DESTE ITEM (EM QUALQUER NÍVEL) É A PÁGINA ATUAL? location = { pathname, search }
export const hasMenuActiveChild = (location, children) => {
    const childrenArray = Children.toArray(children)
    for (const child of childrenArray) {
        if (isValidElement(child)) {
            if (child.type === MenuLink && child.props.path) {
                if (menuPathMatches(child.props.path, location)) {
                    return true
                }
            } else if (hasMenuActiveChild(location, child.props.children)) {
                return true
            }
        }
    }
    return false
}
