    import { createContext, useContext, useEffect, useState, useCallback } from 'react'
    import { useSearchParams } from 'react-router-dom'
    import { api } from '@/services/api'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { toast } from 'sonner'
    import { useAuth } from '@/auth/providers/JWTProvider'

    const PageDataContext = createContext()

    export const PageDataProvider = ({ children }) => {

        const [pageData, setPageData] = useState(null)
        const [loading, setLoading]   = useState(true)
        const [error, setError]       = useState(null)
        const [searchParams]          = useSearchParams()
        const [lastUrl, setLastUrl]   = useState(null)
        const { auth, logout }        = useAuth()

        const callApi = useCallback(async (urlApi) => {
            
            if (urlApi === lastUrl) return

            setLoading(true)
            setLastUrl(urlApi)

            try {
                
                const response = await api.get(urlApi)

                setPageData(response.data.success.response.data)

            } catch (err) {

                toast(`❌ Erro: `, {
                    description: <span style = {{ 'color': 'white' }}> { err?.response?.data?.error?.message }</span>,
                    style: {
                        color: 'white',
                        background: 'var(--tw-danger)',
                        fontWeight: 'bold'
                    }
                })
                
                setError(err)

                if (err.status == 401) {
                    logout()
                }

            } finally {
                setLoading(false)
            }

        }, [])

        useEffect(() => {
            
            const urlApi = buildApiUrl(searchParams)

            if (urlApi === false || urlApi === '/panel/module?slug=dashboard') {

                let pageData = {
                    layout: 'dashboard',
                }

                setPageData(pageData)
                setLoading(false)

                return
            }

            callApi(urlApi)

        }, [searchParams])

        return (
            <PageDataContext.Provider value={{ pageData, loading, error, callApi }}>
                {children}
            </PageDataContext.Provider>
        )

    }

    export const usePageData = () => useContext(PageDataContext)
