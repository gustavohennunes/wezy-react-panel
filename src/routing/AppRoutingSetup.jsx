import { useState, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { DefaultPage } from '@/pages/dashboards'
import { AuthPage } from '@/auth'
import { RequireAuth } from '@/auth/RequireAuth'
import { Panel2Layout } from '@/layouts/panel2'
import { PanelLayout } from '@/layouts/painel'
import { ErrorsRouting } from '@/errors'
import { ScreenLoader } from '@/components/loaders'
import { PageDataProvider } from '@/context/PageDataContext'
const AppRoutingSetup = () => {
    const [layout, setLayout] = useState(null)

    useEffect(() => {
        const layoutConfig = 'demo6'
        //const layoutConfig = Math.random() < 0.5 ? "demo6" : "demo2";
        setLayout(layoutConfig)
    }, [])

    if (!layout) {
        return <ScreenLoader />
    }

    return (
        <Routes>
            <Route element={<RequireAuth />}>
                <Route
                    element={
                        layout === 'demo6' ? <PanelLayout /> : <Panel2Layout />
                    }
                >
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
