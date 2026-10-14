    import { useLayout } from '@/providers'

    import { PanelPage } from '../'

    const DefaultPage = () => {
        
        const { currentLayout } = useLayout()

        if (currentLayout?.name === 'panel-layout') {
            return <PanelPage />
        } else if (currentLayout?.name === 'panel2-layout') {
            return <PanelPage />
        }

    }

    export { DefaultPage }
