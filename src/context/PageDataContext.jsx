import { createContext, useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '@/services/api'

const PageDataContext = createContext()

export const PageDataProvider = ({ children }) => {
    const [pageData, setPageData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const pag = searchParams.get('pag')
        const params = new URLSearchParams(searchParams)

        if (pag) {
            params.set('slug', pag)
            params.delete('pag')
        } else {
            params.set('slug', 'administracao')
        }

        const allowedParams = [
            'p',
            'setor',
            'qua',
            'qui',
            'sex',
            'slug',
            'acao',
        ]
        for (const param of searchParams.keys()) {
            if (!allowedParams.includes(param)) {
                params.delete(param)
            }
        }

        const urlApi = `/panel/module?${params.toString()}`
        //console.log(urlApi)

        setLoading(true)
        api.get(urlApi)
            .then((response) => {
                setPageData(response.data.success.response.data)
            })
            .catch((err) => {
                console.error('Erro ao carregar dados da página:', err)
                setError(err)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [searchParams])

    return (
        <PageDataContext.Provider value={{ pageData, loading, error }}>
            {children}
        </PageDataContext.Provider>
    )
}

export const usePageData = () => useContext(PageDataContext)
