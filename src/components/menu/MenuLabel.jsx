import clsx from 'clsx'
import { propsDeBotao } from './keyboard'
const MenuLabel = ({
    className,
    hasItemSub,
    handleToggle,
    handleClick,
    children,
}) => {
    if (hasItemSub) {
        return (
            <div
                className={clsx('menu-label', className && className)}
                {...propsDeBotao(handleToggle)}
            >
                {children}
            </div>
        )
    } else {
        return (
            <div
                className={clsx('menu-label', className && className)}
                {...propsDeBotao(handleClick)}
            >
                {children}
            </div>
        )
    }
}
export { MenuLabel }
