import { Navigate, Route, Routes, useLocation } from 'react-router'
import { DefaultPage } from '@/pages/dashboards'
import { AuthPage } from '@/auth'
import { RequireAuth } from '@/auth/RequireAuth'
import { PanelLayout } from '@/layouts/painel'
import { ErrorsRouting } from '@/errors'

//LINK LEGADO ABERTO FORA DO ROUTER (target="_blank", NOVA ABA, F5): index.php?pag=... CAÍA NO * E IA PARA O /error/404.
//O SPA SÓ TEM A RAIZ: MESMA QUERY NO /
const IndexPhpLegado = () => {
    const { search, hash } = useLocation()
    return <Navigate to={`/${search}${hash}`} replace />
}

const AppRoutingSetup = () => {

    return (
        <Routes>
            <Route element={<RequireAuth />}>
                <Route element={<PanelLayout />}>
                    <Route path="/" element={<DefaultPage />} />
                </Route>
            </Route>
            <Route path="index.php" element={<IndexPhpLegado />} />
            <Route path="error/*" element={<ErrorsRouting />} />
            <Route path="auth/*" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/error/404" />} />
        </Routes>
    )
}

export { AppRoutingSetup }
