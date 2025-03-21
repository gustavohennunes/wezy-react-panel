
    import { Fragment } from 'react'
    import { Link } from 'react-router-dom'
    import { KeenIcon } from '@/components'
    import { toAbsoluteUrl } from '@/utils'

    const Options = () => {
        
        const items = [
            {
                title: 'Minhas rádios',
                icon: 'user',
                desc: 'Gerencie em instantes suas rádios da revenda Vymber.',
                path: '/account/members/team-info',
            },
            {
                title: 'Dicas e tutoriais',
                icon: 'youtube',
                desc: 'Confira dicas exclusivas para turbinar suas vendas.',
                path: '/account/security/security-log',
            },
            {
                title: 'Pagamentos e assinatura',
                icon: 'two-credit-cart',
                desc: 'Visualize suas faturas, planos e métodos de pagamento.',
                path: '/account/billing/basic',
            },
            {
                title: 'Suporte técnico',
                icon: 'message-programming',
                desc: 'Está enfrentando problemas? Fale com nosso time de especialistas.',
                path: '/account/members/roles',
            },
        ]

        const renderItem = (item, index) => {

            return (
                <div
                    key={index}
                    className="card px-5 lg:px-7.5 h-full bg-[length:85%] [background-position:9rem_-4rem] rtl:[background-position:-4rem_-4rem] bg-no-repeat channel-stats-bg"
                >
                    <div className="flex flex-col gap-4 pt-6">
                        <KeenIcon
                            icon={item.icon}
                            className="text-2xl text-gray-600"
                        />

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
                            to={`${item.path}`}
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
