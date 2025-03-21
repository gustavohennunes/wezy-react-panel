import clsx from 'clsx'
import { Link } from 'react-router-dom'
const ReportSettings = ({ limit, className, title, items }) => {
    const renderItem = (item, index) => {
        return (
            <label
                key={index}
                className={'card-group flex py-4 gap-2.5 justify-between'}
            >
                <div className={'flex gap-2.5 items-center justify-start'}>
                    {item.checked ? (
                        <div className="rounded-md w-6 h-6 flex items-center justify-center bg-success">
                            <i className="ki-filled ki-check text-[10px] text-light"></i>
                        </div>
                    ) : (
                        <div className="rounded-md border-[1px] border-gray-300 w-6 h-6 flex items-center justify-center"></div>
                    )}

                    <div className="flex flex-col justify-center gap-1.5">
                        <span className="leading-none font-medium text-sm text-gray-900">
                            {item.title}
                        </span>
                        {item.description != '' && (
                            <span className="text-2sm text-gray-700">
                                {item.description}
                            </span>
                        )}
                    </div>
                </div>

                {item.path?.url !== undefined &&
                    item.path?.url != '' &&
                    item.path?.title !== undefined &&
                    item.path?.title != '' && (
                        <Link
                            to={item.path.url}
                            className="btn text-primary hover:text-primary-active px-0"
                        >
                            {item.path.title}
                            <i className="ki-filled ki-right text-primary !text-xs"></i>
                        </Link>
                    )}
            </label>
        )
    }

    return (
        <div className={clsx('card', className && className)}>
            <div className="card-header">
                <h3 className="card-title">{title}</h3>
            </div>

            {items.map((item, index) => {
                if (limit === undefined || index < limit) {
                    return renderItem(item, index)
                }
                return null
            })}
        </div>
    )
}

export { ReportSettings }
