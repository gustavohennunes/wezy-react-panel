import { Fragment } from 'react'
import { KeenIcon } from '@/components'
import { useAuth } from '@/auth/providers/JWTProvider'
import { Link } from 'react-router-dom'

const Plans = () => {

    const { userInfos } = useAuth();

    const renderPlanInfo = (type, info) => {
        
        return (
            <Fragment>
                <h3 className="text-lg text-gray-900 font-medium pb-2">
                    {info[1].title}
                </h3>
                
                <div className="text-gray-700 text-2sm">{info[1].description}</div>

                <div className="py-4">

                    <div className="flex items-end gap-1.5">
                        
                        {info?.price && (
                            <>
                                <div className="text-2xl text-gray-900 font-semibold leading-none">
                                    {info.price}
                                </div>
                                <div className="text-gray-700 text-2xs">
                                    por rádio
                                </div>
                            </>
                        )}

                    </div>
                    
                </div>

                <div>  

                    {type === 0 ? (
                        <button className='btn btn-secondary btn-sm text-center flex justify-center w-full'>
                            Plano atual
                        </button>
                    ) : (
                    <Link to={info[1]?.url} target='blank'>
                        <button className='btn btn-primary btn-sm text-center flex justify-center w-full'>
                            Entrar em contato
                        </button>
                    </Link>
                    )}

                </div>
                
            </Fragment>
        );

    }

    const renderFeatureDetail = (detail) => {

        if (detail.indexOf('false') !== -1) {
            return detail ? (
                <KeenIcon icon="cross" className="text-danger text-lg" />
            ) : null
        }

        if (detail.indexOf('true') !== -1) {
            return detail ? (
                <KeenIcon icon="check" className="text-success text-lg" />
            ) : null
        }

        return <div className="text-gray-800 text-2sm">{detail}</div>

    }

    const renderItem = (feature, index) => {
        
        return (
            <tr key={index}>
                <td className="table-border-s !px-5 !py-3.5">
                    <div className="text-gray-900 text-2sm leading-none font-medium">
                        {feature.title}
                    </div>
                </td>
                
                {feature?.plans && typeof feature.plans === 'object' && Object.entries(feature.plans).map(([planKey, planValue], item) => (
                    <td key={item} className="table-border-s !px-5 !py-3.5">
                        {renderFeatureDetail(planValue)}
                    </td>
                ))}
                
            </tr>
        )

    }

    return (
        <div className="scrollable-x-auto pt-3 -mt-3">
            <table
                className="table table-fixed min-w-[1000px] table-border-b table-border-e table-rounded card-rounded [&_tr:nth-of-type(2)>td]:table-border-t [&_tr:nth-of-type(2)>td:first-child]:card-rounded-ts"
            >
                <tbody>
                    <tr>
                        <td className="!border-b-0 align-bottom !p-5 !pt-7.5 !pb-6">
                            
                        </td>

                        {userInfos?.plans?.info && typeof userInfos?.plans?.info === 'object' && Object.entries(userInfos?.plans?.info).map((plan, index) => (
                        <td key={index} className="!border-b-0 table-border-s table-border-t card-rounded-tl bg-light-active dark:bg-coal-100 !p-5 !pt-7.5 relative">
                            
                            {index === 0 && (
                            <span className="absolute badge badge-sm badge-outline badge-success absolutes top-0 start-1/2 rtl:translate-x-1/2 -translate-x-1/2 -translate-y-1/2">
                                Plano atual
                            </span>
                            )}

                            {renderPlanInfo(index, plan)}

                        </td>
                        ))}
                        
                    </tr>

                    {Array.isArray(userInfos?.plans?.features) &&userInfos?.plans?.features?.map((feature, index) =>
                        renderItem(feature, index)
                    )}

                </tbody>

            </table>

        </div>
    )

}

export { Plans }
