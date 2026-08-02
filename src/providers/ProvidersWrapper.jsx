import { QueryClient, QueryClientProvider } from 'react-query'
import { AuthProvider } from '@/auth/providers/JWTProvider'
import {
    LayoutProvider,
    LoadersProvider,
    MenusProvider,
    SettingsProvider,
    SystemProvider,
    TranslationProvider,
} from '@/providers'
import { HelmetProvider } from 'react-helmet-async'
const queryClient = new QueryClient()
const ProvidersWrapper = ({ children }) => {
    return (
        <SystemProvider>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SettingsProvider>
                    <TranslationProvider>
                        <HelmetProvider>
                            <LayoutProvider>
                                <LoadersProvider>
                                    <MenusProvider>{children}</MenusProvider>
                                </LoadersProvider>
                            </LayoutProvider>
                        </HelmetProvider>
                    </TranslationProvider>
                </SettingsProvider>
            </AuthProvider>
        </QueryClientProvider>
        </SystemProvider>
    )
}
export { ProvidersWrapper }
