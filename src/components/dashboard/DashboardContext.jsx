
    import { useState, useEffect } from 'react'
    import { BlockList, ReportSettings } from '@/pages/account/security/privacy-settings'
    import { EntryCallout, Teams } from '@/pages/dashboards/demo1'
    import { useAuth } from '@/auth/providers/JWTProvider'

    import { ChannelStats } from './ChannelStats'
    import { MyBalance } from './MyBalance'
    import { Options } from './Options'

    const DashboardContext = ({ data }) => {

        const { userInfos } = useAuth()

        const [ itemsChannel, setItemsChannel ]           = useState([])
        const [ itemsReport, setItemsReport ]             = useState([])
        const [ paymentsPeriods, setPaymentsPeriods ]     = useState({data: [], categories: []})
        const [ cardsItems, setCardsItems ]               = useState([])
        const [ finalizedRegister, setFinalizedRegister ] = useState(false)

        useEffect(() => {
            
            if (userInfos) {

                if(userInfos?.user?.config_domains && userInfos?.user?.config_personalized && userInfos?.indicators?.users > 0) {
                    setFinalizedRegister(true)
                }

                setItemsChannel([
                    {
                        logo: '',
                        info: userInfos?.indicators?.users || 0,
                        desc: 'Rádios cadastradas',
                        path: '',
                    },
                    {
                        logo: '',
                        info: userInfos?.indicators?.users_online || 0,
                        desc: 'Online no momento',
                        path: '',
                    },
                    {
                        logo: '',
                        info: userInfos?.indicators?.listened_musics || 0,
                        desc: 'Músicas ouvidas',
                        path: '',
                    },
                    {
                        logo: '',
                        logoDark: 'tiktok-dark.svg',
                        info: userInfos?.indicators?.used_spots || 0,
                        desc: 'Spots solicitados',
                        path: '',
                    },
                ]);

                setItemsReport([
                    {
                        title: 'Finalizar cadastro',
                        description: '',
                        checked: true,
                    },
                    {
                        title: 'Criar sua primeira rádio',
                        description: '',
                        path: {
                            url: '?pag=minhas-radios&acao=Inserir',
                            title: 'Minhas rádios',
                        },
                        checked: (userInfos?.indicators?.users > 0),
                    },
                    {
                        title: 'Configurar seu domínio',
                        description: '',
                        path: {
                            url: '?pag=dominios',
                            title: 'Meus domínios',
                        },
                        checked: userInfos?.user?.config_domains,
                    },
                    {
                        title: 'Personalizar sua rádio',
                        description: '',
                        path: {
                            url: '?pag=configuracoes',
                            title: 'Configurações',
                        },
                        checked: userInfos?.user?.config_personalized,
                    },
                    {
                        title: 'Faturar alto!',
                        description: '',
                        checked: false,
                    },
                ]);

                setPaymentsPeriods({
                    data: userInfos?.payments?.data,
                    categories: userInfos?.payments?.categories
                });

                setCardsItems([
                    {
                        title: 'Minhas rádios',
                        icon: 'user',
                        desc: 'Gerencie em instantes suas rádios da revenda Vymber.',
                        path: {
                            url: '?pag=minhas-radios',
                            title: 'Minhas rádios',
                            target: '_self'
                        },
                    },
                    {
                        title: 'Dicas e tutoriais',
                        icon: 'youtube',
                        desc: 'Confira dicas exclusivas para turbinar suas vendas.',
                        path: {
                            url: userInfos?.links?.link_ajuda,
                            title: 'Dicas',
                            target: '_blank',
                        },
                    },
                    {
                        title: 'Pagamentos e assinatura',
                        icon: 'two-credit-cart',
                        desc: 'Visualize suas faturas, planos e métodos de pagamento.',
                        path: {
                            url: '?pag=meus-pagamentos',
                            title: 'Meus pagamentos',
                            target: '_self'                            
                        },
                    },
                    {
                        title: 'Suporte técnico',
                        icon: 'message-programming',
                        desc: 'Está enfrentando problemas? Fale com nosso time de especialistas.',
                        path: {
                            url: userInfos?.links?.link_suporte,
                            title: 'Suporte',
                            target: '_blank',
                        },
                    },
                ]);

            }

        }, [ userInfos ]);

        return (
            <div className="grid gap-5 lg:gap-7.5">

                <EntryCallout className="h-full" />

                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-y-5 lg:gap-7.5 items-stretch">
                    
                    {finalizedRegister === false && (
                        <div className="col-span-1">
                            <ReportSettings
                                className="h-full"
                                title="Falta muito pouco!"
                                items={itemsReport}
                                position="left"
                            />
                        </div>
                    )}

                    <div className={finalizedRegister === false ? 'col-span-1 lg:col-span-1 2xl:col-span-2' : 'col-span-2 xl:col-span-3'}>
                        <div className={finalizedRegister === false ? 'grid grid-cols-2 gap-5 lg:gap-7.5 h-full items-stretch' : 'grid grid-cols-2 sm:grid-cols-4 gap-5 lg:gap-7.5 h-full items-stretch'}>
                            <ChannelStats title="Canais" items={itemsChannel} />
                        </div>
                    </div>

                </div>

                <div className="grid lg:grid-cols-3 gap-y-5 lg:gap-7.5 items-stretch">

                    <div className="lg:col-span-2">
                        <div className="grid md:grid-cols-2 gap-5 lg:gap-7.5 h-full items-stretch">
                            <Options 
                                items={cardsItems}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <MyBalance className="h-full" periods={paymentsPeriods} />
                    </div>
                </div>
            </div>
        )
    }

    export { DashboardContext }
