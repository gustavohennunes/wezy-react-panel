import { Navigate, Route, Routes } from 'react-router'
import { DefaultPage } from '@/pages/dashboards'
import { AuthPage } from '@/auth'
import { RequireAuth } from '@/auth/RequireAuth'
import { PanelLayout } from '@/layouts/painel'
import { ErrorsRouting } from '@/errors'

const AppRoutingSetup = () => {

    return (
        <Routes>
            <Route element={<RequireAuth />}>
                <Route element={<PanelLayout />}>
                    <Route path="/" element={<DefaultPage />} />
                </Route>
            </Route>
            <Route path="error/*" element={<ErrorsRouting />} />
            <Route path="auth/*" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/error/404" />} />
        </Routes>
    )
}

export { AppRoutingSetup }
