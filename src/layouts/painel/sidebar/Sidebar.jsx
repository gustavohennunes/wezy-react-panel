    import { useEffect, useRef, useState } from 'react'
    import { useResponsive } from '@/hooks'
    import { usePanelLayout } from '../'
    import { SidebarHeader, SidebarMenu, SidebarFooter } from './'
    import { usePathname } from '@/providers'
    import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

    const Sidebar = () => {

        const headerRef                                   = useRef(null)
        const footerRef                                   = useRef(null)
        const desktopMode                                 = useResponsive('up', 'lg')
        const { pathname, prevPathname }                  = usePathname()
        const { mobileSidebarOpen, setMobileSidebarOpen } = usePanelLayout()
        const [ search, setSearch ]                       = useState('')
        

        const handleMobileSidebarClose = () => {
            setMobileSidebarOpen(false)
        }

        const renderContent = () => {

            return (
                <div className="fixed flex top-0 bottom-0 z-20 lg:flex flex-col shrink-0 w-[--tw-sidebar-width] bg-[--tw-page-bg] dark:bg-[--tw-page-bg-dark]">
                    
                    <SidebarHeader 
                        ref={headerRef} 
                        search={search}
                        setSearch={setSearch}
                    />

                    <SidebarMenu 
                        search={search}
                        setSearch={setSearch}
                    />

                    <SidebarFooter ref={footerRef} />

                </div>
            )

        }

        useEffect(() => {

            if (!desktopMode && prevPathname !== pathname) {
                setMobileSidebarOpen(false)
            }

        }, [desktopMode, pathname, prevPathname, setMobileSidebarOpen])

        if (desktopMode) {
            return renderContent()
        } else {

            return (
                <Sheet
                    open={mobileSidebarOpen}
                    onOpenChange={handleMobileSidebarClose}
                >
                    <SheetContent
                        className="border-0 p-0 w-[--tw-sidebar-width] scrollable-y-auto"
                        forceMount={true}
                        side="left"
                        close={false}
                    >
                        <SheetHeader className="sr-only">
                            <SheetTitle>Mobile Menu</SheetTitle>
                            <SheetDescription></SheetDescription>
                        </SheetHeader>
                        {renderContent()}
                    </SheetContent>
                </Sheet>
            )

        }

    }

    export { Sidebar }
