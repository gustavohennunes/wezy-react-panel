import { Link, useLocation } from 'react-router-dom'
import { KeenIcon } from '@/components/keenicons'
import { toAbsoluteUrl } from '@/utils'
import { MENU_ROOT } from '@/config'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/i18n'
const HeaderLogo = () => {
    const { pathname } = useLocation()
    const { isRTL } = useLanguage()
    const [selectedMenuItem, setSelectedMenuItem] = useState(MENU_ROOT[1])
    useEffect(() => {
        MENU_ROOT.forEach((item) => {
            if (item.rootPath && pathname.includes(item.rootPath)) {
                setSelectedMenuItem(item)
            }
        })
    }, [pathname])
    return (
        <div className="flex items-center gap-2 lg:gap-5 2xl:-ml-[60px]">
            <Link to="/" className="shrink-0">
                <img
                    src={toAbsoluteUrl('/media/app/mini-logo-circle.svg')}
                    className="dark:hidden min-h-[42px]"
                    alt="logo"
                />
                <img
                    src={toAbsoluteUrl('/media/app/mini-logo-circle-dark.svg')}
                    className="hidden dark:inline-block min-h-[42px]"
                    alt="logo"
                />
            </Link>

            <div className="flex items-center">
                <h3 className="text-gray-700 text-base hidden md:block">
                    Cayman Sistemas
                </h3>
            </div>
        </div>
    )
}
export { HeaderLogo }
