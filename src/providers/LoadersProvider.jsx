/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import { ProgressBarLoader, ScreenLoader } from '@/components/loaders'
const initialProps = {
    contentLoader: false,
    setContentLoader: (state) => {},
    progressBarLoader: false,
    setProgressBarLoader: (state) => {},
    screenLoader: false,
    setScreenLoader: (state) => {},
}
const LoadersContext = createContext(initialProps)
const useLoaders = () => useContext(LoadersContext)
const LoadersProvider = ({ children }) => {
    const [contentLoader, setContentLoader] = useState(false)
    const [progressBarLoader, setProgressBarLoader] = useState(false)
    const [screenLoader, setScreenLoader] = useState(false)
    //VALUE MEMOIZADO: SÓ MUDA QUANDO UM DOS LOADERS MUDA (OS setters DO useState SÃO ESTÁVEIS)
    const value = useMemo(
        () => ({ contentLoader, setContentLoader, progressBarLoader, setProgressBarLoader, screenLoader, setScreenLoader }),
        [contentLoader, progressBarLoader, screenLoader]
    )
    return (
        <LoadersContext.Provider value={value}>
            {children}
            {progressBarLoader && <ProgressBarLoader />}
            {screenLoader && <ScreenLoader />}
        </LoadersContext.Provider>
    )
}
export { LoadersProvider, useLoaders }
