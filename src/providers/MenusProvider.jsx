    import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
    import { useAuth } from '../auth/providers/JWTProvider'
    import { getCustomerHost } from '@/utils/customerHost'
    import { getAuthToken } from '@/auth/_helpers'
    import {
        isSystemNotFoundError,
        notifySystemNotFound,
    } from '@/utils/systemStatus'
    import axios from 'axios'

    const initialProps = {
        configs: new Map(),
        fetchMenu: () => {},
        setMenuConfig: () => {},
        getMenuConfig: () => null,
        setCurrentMenuItem: () => {},
        getCurrentMenuItem: () => null,
    }

    const MenuContext = createContext(initialProps)
    const useMenus = () => useContext(MenuContext)

    const MenusProvider = ({ children }) => {
        
        const { auth, logout } = useAuth()
        const [currentMenuItem, setCurrentMenuItem] = useState(null)
        const [configs, setConfigs] = useState(() => new Map())

        //logout VEM DO AuthProvider E MUDA A CADA RENDER DELE; A REF DEIXA O fetchMenu ESTÁVEL
        //SEM CHAMAR UM logout ANTIGO
        const logoutRef = useRef(logout)
        useEffect(() => {
            logoutRef.current = logout
        })

        const setMenuConfig = useCallback((name, config) => {

            setConfigs((prevConfigs) => {
                const newConfigs = new Map(prevConfigs)
                newConfigs.set(name, config)
                return newConfigs
            })

        }, [])

        const getCurrentMenuItem = useCallback(() => {
            return currentMenuItem
        }, [currentMenuItem])

        const getMenuConfig = useCallback((name) => {
            return configs.get(name) ?? null
        }, [configs])

        const fetchMenu = useCallback(async () => {

            //ERRO DE UMA REQUISIÇÃO FEITA COM UM TOKEN QUE JÁ FOI TROCADO (OUTRO LOGIN/PAINEL NO MEIO) NÃO DESLOGA:
            //O logout() INVALIDARIA NA API O TOKEN NOVO
            const tokenUsado = getAuthToken()
            const deslogarSeMesmoToken = () => {
                if (getAuthToken() === tokenUsado) logoutRef.current()
            }

            try {

                await axios
                    .get(`${import.meta.env.VITE_CAYMAN_API_URL}/panel/menus`, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Customer-Host': getCustomerHost(),
                        },
                    })
                    .then((response) => {
                        const data = response.data.success.response.data
                        setMenuConfig('primary', data)
                        return data
                    })
                    .catch((error) => {
                        if (isSystemNotFoundError(error)) {
                            notifySystemNotFound()
                            return
                        }
                        deslogarSeMesmoToken()
                        console.log(error)
                    })

            } catch (error) {
                if (isSystemNotFoundError(error)) {
                    notifySystemNotFound()
                    return
                }
                deslogarSeMesmoToken()
                console.error('Erro ao buscar menu:', error)
            }

        }, [setMenuConfig])

        useEffect(() => {
            if (auth) {
                fetchMenu()
            }
        }, [auth, fetchMenu])

        const value = useMemo(
            () => ({ configs, fetchMenu, setMenuConfig, getMenuConfig, setCurrentMenuItem, getCurrentMenuItem }),
            [configs, fetchMenu, setMenuConfig, getMenuConfig, getCurrentMenuItem]
        )

        return (
            <MenuContext.Provider
                value={value}
            >
                {children}
            </MenuContext.Provider>
        )
    }

    // eslint-disable-next-line react-refresh/only-export-components
    export { MenusProvider, useMenus }
