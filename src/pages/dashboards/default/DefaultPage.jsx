    import { useLayout } from '@/providers'

    import { PanelPage } from '../'

    const DefaultPage = () => {
        
        const { currentLayout } = useLayout()

        //O PanelLayout REGISTRA O LAYOUT NUM EFFECT: ATÉ LÁ NÃO HÁ O QUE MOSTRAR
        return currentLayout?.name === 'panel-layout' ? <PanelPage /> : null

    }

    export { DefaultPage }
