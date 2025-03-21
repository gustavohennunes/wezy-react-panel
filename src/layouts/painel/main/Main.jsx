    import { Fragment, useState, useEffect } from 'react'
    import { Helmet } from 'react-helmet-async'
    import { Outlet, useLocation } from 'react-router'
    import { useMenuCurrentItem } from '@/components/menu'
    import { Footer, Header, Sidebar, Toolbar, ToolbarHeading } from '../'
    import { useMenus } from '@/providers'
    import { useResponsive } from '@/hooks'
    import { usePageData } from '@/context/PageDataContext'

    const Main = () => {

        const mobileMode                    = useResponsive('down', 'lg')
        const { pathname }                  = useLocation()
        const { getMenuConfig }             = useMenus()
        const menuConfig                    = getMenuConfig('primary')
        const menuItem                      = useMenuCurrentItem(pathname, menuConfig)
        const { pageData }                  = usePageData()
        
        const [title, setTitle]             = useState('')
        const [breadcrumbs, setBreadcrumbs] = useState('')

        useEffect(() => {
            
            setTitle(pageData?.params?.title || '')

            setBreadcrumbs(
                (pageData?.params?.breadcrumbs || '')
                    .replaceAll('index.php', 'modulos')
                    .replaceAll('class="', 'class="text-sm ')
                    .replaceAll(' > ', '<i class="ki-filled ki-right text-gray-500 !text-[11px] mx-1.5"></i>')
            );

        }, [pageData])

        return (
            <Fragment>

                <Helmet>
                    
                    <title>{title}</title>

                    <link rel="icon" href="" />
                    
                    <meta name="description" content="" />
                    <meta name="keywords" content="" />

                </Helmet>

                <div className="flex grow">

                    <Sidebar />
                    
                    {mobileMode && <Header />}

                    <div className="flex flex-col lg:flex-row grow pt-[--tw-header-height] lg:pt-0">

                        <div className="flex flex-col grow items-stretch rounded-xl bg-[--tw-content-bg] dark:bg-[--tw-content-bg-dark] border border-gray-300 dark:border-gray-200 lg:ms-[--tw-sidebar-width] mt-0 lg:mt-[15px] m-[15px]">

                            <div className="flex flex-col grow lg:scrollable-y-auto lg:[scrollbar-width:auto] lg:light:[--tw-scrollbar-thumb-color:var(--tw-content-scrollbar-color)] pt-5">

                                <main className="grow" role="content">

                                    <Toolbar>
                                        
                                        {title && (
                                            <ToolbarHeading title={title} />
                                        )}

                                        {breadcrumbs && (
                                            <div className="breadcrumbs mt-0.5" dangerouslySetInnerHTML={{ __html: breadcrumbs }} />
                                        )}

                                    </Toolbar>

                                    <Outlet />

                                </main>

                                <Footer />

                            </div>

                        </div>

                    </div>

                </div>

            </Fragment>
        );

    }

    export { Main }