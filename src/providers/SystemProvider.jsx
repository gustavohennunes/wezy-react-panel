import { createContext, useContext, useEffect, useState } from 'react'
import {
    isSystemNotFound,
    subscribeSystemStatus,
} from '@/utils/systemStatus'
import { getCustomerHost } from '@/utils/customerHost'
import { SystemNotFoundPage } from '@/errors/SystemNotFoundPage'

const SystemContext = createContext({ systemNotFound: false })

const useSystem = () => useContext(SystemContext)

const SystemProvider = ({ children }) => {
    const [systemNotFound, setSystemNotFound] = useState(isSystemNotFound())

    useEffect(() => {
        // Assina o sinal disparado por qualquer parte do app (ex.: interceptors)
        const unsubscribe = subscribeSystemStatus((value) =>
            setSystemNotFound(value)
        )

        // Verifica logo no boot se o host pode ser resolvido
        getCustomerHost()

        return unsubscribe
    }, [])

    if (systemNotFound) {
        return <SystemNotFoundPage />
    }

    return (
        <SystemContext.Provider value={{ systemNotFound }}>
            {children}
        </SystemContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export { SystemProvider, useSystem, SystemContext }
