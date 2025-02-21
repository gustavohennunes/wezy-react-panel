import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '@/services/api'
import { buildApiUrl } from '@/utils/urlHelper'

const PageDataContext = createContext()

export const PageDataProvider = ({ children }) => {
    const [pageData, setPageData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchParams] = useSearchParams()
    const [lastUrl, setLastUrl] = useState(null)

    const callApi = useCallback(async (urlApi) => {
        if (urlApi === lastUrl) return
        setLoading(true)
        setLastUrl(urlApi)
        try {
            const response = await api.get(urlApi)
            setPageData(response.data.success.response.data)
        } catch (err) {
            console.log(err)
            console.error('❌ Erro ao carregar dados da página:', err)
            setError(err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const urlApi = buildApiUrl(searchParams)
        callApi(urlApi)
    }, [searchParams])

    return (
        <PageDataContext.Provider value={{ pageData, loading, error, callApi }}>
            {children}
        </PageDataContext.Provider>
    )
}

export const usePageData = () => useContext(PageDataContext)
