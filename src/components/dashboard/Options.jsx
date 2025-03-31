import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { KeenIcon } from '@/components'
import { toAbsoluteUrl } from '@/utils'

const Options = ({ items }) => {
    
    const renderItem = (item, index) => {
        
        return (
            <div
                key={index}
                className="card px-5 lg:px-7.5 h-full bg-[length:85%] [background-position:9rem_-4rem] rtl:[background-position:-4rem_-4rem] bg-no-repeat channel-stats-bg"
            >
                <div className="flex flex-col gap-4 pt-6">
                    
                    {item.icon && (
                    <KeenIcon
                        icon={item.icon}
                        className="text-2xl text-gray-600"
                    />
                    )}

                    <div className="flex flex-col gap-2.5 mb-2">
                        <h3 className="text-base font-medium leading-none text-gray-900">
                            {item.title}
                        </h3>
                        <span className="text-2sm text-gray-800 leading-5">
                            {item.desc}
                        </span>
                    </div>
                </div>

                <div className="flex mb-4 items-center gap-1 cursor-pointer">
                    <Link
                        to={item.path.url}
                        title={item.path.title}
                        target={item.path.target}
                        className="btn text-primary hover:text-primary-active px-0"
                    >
                        Ver mais
                    </Link>
                    <KeenIcon icon="right" className="text-primary text-xs" />
                </div>
            </div>
        )
    }

    return (
        <Fragment>
            <style>
                {`
            .channel-stats-bg {
                background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3.png')}');
            }
            .dark .channel-stats-bg {
                background-image: url('${toAbsoluteUrl('/media/images/2600x1600/bg-3-dark.png')}');
            }
            `}
            </style>

            {items.map((item, index) => {
                return renderItem(item, index)
            })}
        </Fragment>
    )
}

export { Options }
