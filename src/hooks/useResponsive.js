import tailwindConfig from 'tailwindcss/defaultConfig'
import { useMediaQuery } from './useMediaQuery'
const breakpoints = ['sm', 'md', 'lg', 'xl', '2xl']

//MONTA A MEDIA QUERY ('up' | 'down' | 'between'). null QUANDO OS PARÂMETROS NÃO FORMAM UMA QUERY
const mediaQueryFor = (query, key, start, end) => {
    const screens = tailwindConfig?.theme?.screens
    const resolve = (value) => (breakpoints.includes(value) && screens ? screens[value] : value)
    if (query === 'up' && key) {
        return `(min-width: ${resolve(key)})`
    }
    if (query === 'down' && key) {
        return `(max-width: ${resolve(key)})`
    }
    if (query === 'between' && start && end) {
        return `(min-width: ${resolve(start)}) and (max-width: ${resolve(end)})`
    }
    return null
}

//O useMediaQuery É CHAMADO SEMPRE (REGRA DOS HOOKS); SEM QUERY VÁLIDA USA 'not all', QUE NUNCA
//CASA, E DEVOLVE undefined COMO ANTES
const useResponsive = (query, key, start, end) => {
    const mediaQuery = mediaQueryFor(query, key, start, end)
    const matches = useMediaQuery(mediaQuery || 'not all')
    return mediaQuery ? matches : undefined
}
export { useResponsive, mediaQueryFor }
