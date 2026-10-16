    import { KeenIcon } from '@/components'
    import { PanelLogo } from '@/layouts/painel/PanelLogo'
    import { Container } from '@/components/container'
    import { toAbsoluteUrl } from '@/utils'
    import { Link } from 'react-router-dom'
    import { usePanelLayout } from '../'

    const Header = () => {

        const { setMobileSidebarOpen } = usePanelLayout()
        const handleMobileSidebarOpen = () => {
            setMobileSidebarOpen(true)
        }

        return (
            <header className="flex lg:hidden items-center fixed z-10 top-0 start-0 end-0 shrink-0 bg-[--tw-page-bg] dark:bg-[--tw-page-bg-dark] h-[--tw-header-height]">
                <Container className="flex items-center justify-between flex-wrap gap-3">
                    <Link to="/">
                        <PanelLogo />
                    </Link>

                    <button
                        type="button"
                        onClick={handleMobileSidebarOpen}
                        className="btn btn-icon btn-light btn-clear btn-sm me-2"
                        aria-label="Abrir menu"
                    >
                        <KeenIcon icon="menu" />
                    </button>
                </Container>
            </header>
        )
        
    }

    export { Header }
