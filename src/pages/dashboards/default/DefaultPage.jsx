    import { useLayout } from '@/providers'

    import { Demo1LightSidebarPage, Demo2Page, Demo4Page, Demo5Page, PanelPage } from '../'

    const DefaultPage = () => {
        
        const { currentLayout } = useLayout()

        if (currentLayout?.name === 'panel-layout') {
            return <PanelPage />
        } else if (currentLayout?.name === 'panel2-layout') {
            return <PanelPage />
        }

    }

    export { DefaultPage }
