import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
const getMatches = (query) => {
    // Prevents SSR issues
    if (typeof window !== 'undefined') {
        return window.matchMedia(query).matches
    }
    return false
}
const useMediaQuery = (query) => {
    //INICIALIZAÇÃO PREGUIÇOSA: getMatches SÓ RODA NO PRIMEIRO RENDER
    const [matches, setMatches] = useState(() => getMatches(query))
    useEffect(() => {
        function handleChange() {
            setMatches(getMatches(query))
        }
        const matchMedia = window.matchMedia(query)

        // Triggered at the first client-side load and if query changes
        handleChange()
        matchMedia.addEventListener('change', handleChange)
        return () => {
            matchMedia.removeEventListener('change', handleChange)
        }
    }, [query])
    return matches
}

//VÁRIAS MEDIA QUERIES COM UM ÚNICO HOOK — A QUANTIDADE DE HOOKS NÃO MUDA ENTRE RENDERS, MESMO QUE
//A LISTA DE QUERIES MUDE. queries VEM COMO STRING ("q1||q2") PARA SER UMA DEPENDÊNCIA ESTÁVEL.
//DEVOLVE UMA STRING DE "0"/"1" NA MESMA ORDEM (SNAPSHOT PRIMITIVO, SEM RE-RENDER À TOA).
const SEPARADOR = '||'
const useMediaQueries = (queries) => {
    const subscribe = useCallback((notify) => {
        if (typeof window === 'undefined' || !queries) return () => {}
        const lists = queries.split(SEPARADOR).map((query) => window.matchMedia(query))
        lists.forEach((list) => list.addEventListener('change', notify))
        return () => lists.forEach((list) => list.removeEventListener('change', notify))
    }, [queries])
    const getSnapshot = useCallback(
        () => (queries ? queries.split(SEPARADOR).map((query) => (getMatches(query) ? '1' : '0')).join('') : ''),
        [queries]
    )
    return useSyncExternalStore(subscribe, getSnapshot, () => '')
}
export { useMediaQuery, useMediaQueries, SEPARADOR as MEDIA_QUERIES_SEPARATOR }
