import clsx from 'clsx'
import { propsDeBotao } from './keyboard'

const MenuToggle = ({ className, hasItemSub = false, handleToggle, children }) => {

    if (hasItemSub) {

        return (
            <div
                className={clsx('menu-toggle', className && className)}
                {...propsDeBotao(handleToggle)}
            >
                {children}
            </div>
        )

    } else {

        return (
            <div className={clsx('menu-toggle', className && className)}>
                {children}
            </div>
        )

    }

}

export { MenuToggle }
