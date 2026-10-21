import { useMemo } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useSettings } from '@/providers/SettingsProvider'

export const DatePickersProvider = ({ children }) => {
    const { getThemeMode } = useSettings()
    const mode = getThemeMode()
    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'dark' ? {
                background: { paper: '#111217' },
                text: { primary: '#fff', secondary: '#cbd5e1' },
            } : {}),
        },
    }), [mode])

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                {children}
            </LocalizationProvider>
        </ThemeProvider>
    )
}
