    import { Fragment } from 'react'
    import { toAbsoluteUrl } from '@/utils/Assets'

    const ChannelStats = ({ title, items }) => {

        const renderItem = (item, index) => {

            return (
                <div key={index} className="card flex-col justify-end py-8 gap-6 h-full bg-cover rtl:bg-[left_top_-1.7rem] bg-[right_top_-1.7rem] bg-no-repeat channel-stats-bg">

                    <div className="flex flex-col gap-1 px-5">

                        <span className="text-3xl font-semibold text-gray-900">
                            {item.info}
                        </span>
                        <span className="text-2sm font-normal text-gray-700">
                            {item.desc}
                        </span>

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

    export { ChannelStats }
