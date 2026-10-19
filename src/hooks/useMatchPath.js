import { matchPath } from 'react-router-dom'
import { menuPathMatches } from '@/components/menu/utils'
import { useMenuLocation } from '@/components/menu/MenuModulo'
const useMatchPath = (path, mode = 'default') => {
    //MESMA LOCALIZAÇÃO DO MenuItem (COM O MÓDULO DO MenuModuloProvider, QUANDO HOUVER)
    const location = useMenuLocation()
    const { pathname } = location
    let match = false
    //LINK COM QUERY (?pag=...): NESTE PAINEL O PATHNAME É SEMPRE "/", ENTÃO O MÓDULO DECIDE
    if (path.includes('?')) {
        return {
            match: menuPathMatches(path, location),
            isExternal: path.startsWith('http') || path.startsWith('//'),
        }
    }
    if (
        mode === 'default' &&
        matchPath(
            {
                path,
                end: true,
            },
            pathname
        )
    ) {
        match = true
    } else if (
        mode === 'full' &&
        matchPath(
            {
                path,
                end: false,
            },
            pathname
        )
    ) {
        match = true
    }
    return {
        match,
        isExternal: path.startsWith('http') || path.startsWith('//'),
    }
}
export { useMatchPath }
