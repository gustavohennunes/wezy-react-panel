    import { KeenIcon } from '@/components'
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
                        <img
                            src="https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/dfca77e57617844b2a0d41057e7b884a/logo-vymber.svg"
                            className="dark:hidden"
                            style={{ width: '135px' }}
                        />
                        <img
                            src="https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/dfca77e57617844b2a0d41057e7b884a/logo-vymber.svg"
                            className="hidden dark:block"
                            style={{
                                filter: 'brightness(100)',
                                width: '135px',
                            }}
                        />
                    </Link>

                    <button
                        onClick={handleMobileSidebarOpen}
                        className="btn btn-icon btn-light btn-clear btn-sm me-2"
                    >
                        <KeenIcon icon="menu" />
                    </button>
                </Container>
            </header>
        )
        
    }

    export { Header }
