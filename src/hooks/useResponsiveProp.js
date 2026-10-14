import { mediaQueryFor } from './useResponsive'
import { useMediaQueries, MEDIA_QUERIES_SEPARATOR } from './useMediaQuery'

//PROP RESPONSIVA: { up: breakpoint } / { down: breakpoint }. ANTES O useResponsive ERA CHAMADO
//DENTRO DO for/if, E A QUANTIDADE DE HOOKS MUDAVA ENTRE RENDERS. AGORA TODAS AS QUERIES SÃO
//AVALIADAS POR UM ÚNICO HOOK, COM O MESMO RESULTADO DE ANTES.
export default function useResponsiveProp(prop, defaultProp = null) {
    const condicoes =
        prop && typeof prop === 'object'
            ? Object.keys(prop).filter((condition) => condition === 'up' || condition === 'down')
            : []
    const queries = condicoes.map((condition) => mediaQueryFor(condition, prop[condition]) || 'not all')
    const matches = useMediaQueries(queries.join(MEDIA_QUERIES_SEPARATOR))

    let value = prop
    condicoes.forEach((condition, index) => {
        if (matches[index] === '1') {
            const breakpoint = prop[condition]
            value = prop[condition][breakpoint]
        }
    })
    value = value ?? defaultProp
    return value
}
export { useResponsiveProp }
