/* eslint-disable no-unused-vars */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { defaultSettings } from '@/config/settings.config'
import { getData, setData } from '@/utils'
const SETTINGS_CONFIGS_KEY = 'settings-configs'
const getStoredSettings = () => {
    return getData(SETTINGS_CONFIGS_KEY) || {}
}
const initialProps = {
    settings: {
        ...defaultSettings,
        ...getStoredSettings(),
    },
    updateSettings: (settings) => {},
    storeSettings: (settings) => {},
    getThemeMode: () => 'light',
}
const LayoutsContext = createContext(initialProps)
const useSettings = () => useContext(LayoutsContext)
const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(initialProps.settings)
    //FORMA FUNCIONAL: DUAS ATUALIZAÇÕES SEGUIDAS NÃO SE SOBRESCREVEM (ANTES A SEGUNDA PARTIA DO
    //settings ANTIGO E DESFAZIA A PRIMEIRA)
    const updateSettings = useCallback((newSettings) => {
        setSettings((atual) => ({
            ...atual,
            ...newSettings,
        }))
    }, [])
    const storeSettings = useCallback((newSettings) => {
        setData(SETTINGS_CONFIGS_KEY, {
            ...getStoredSettings(),
            ...newSettings,
        })
        updateSettings(newSettings)
    }, [updateSettings])
    const themeMode = settings.themeMode
    const getThemeMode = useCallback(() => {
        if (themeMode === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
        } else if (themeMode === 'dark') {
            return 'dark'
        } else {
            return 'light'
        }
    }, [themeMode])
    const value = useMemo(
        () => ({ settings, updateSettings, storeSettings, getThemeMode }),
        [settings, updateSettings, storeSettings, getThemeMode]
    )
    return (
        <LayoutsContext.Provider value={value}>
            {children}
        </LayoutsContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export { SettingsProvider, useSettings }
