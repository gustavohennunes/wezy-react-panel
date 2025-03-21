
    import { useState, useEffect } from 'react'
    import { BlockList, ReportSettings } from '@/pages/account/security/privacy-settings'
    import { EntryCallout, Teams } from '@/pages/dashboards/demo1'
    
    import { ChannelStats } from './ChannelStats'
    import { MyBalance } from './MyBalance'
    import { Options } from './Options'

    const DashboardContext = ({ data }) => {

        const itemsChannel = [
            {
                logo: 'linkedin-2.svg',
                info: '0',
                desc: 'Rádios cadastradas',
                path: '',
            },
            {
                logo: 'youtube-2.svg',
                info: '0',
                desc: 'Online no momento',
                path: '',
            },
            {
                logo: 'instagram-03.svg',
                info: '0',
                desc: 'Músicas ouvidas',
                path: '',
            },
            {
                logo: 'tiktok.svg',
                logoDark: 'tiktok-dark.svg',
                info: '0',
                desc: 'Spots solicitados',
                path: '',
            },
        ]

        const itemsReport = [
            {
                title: 'Finalizar cadastro',
                description: '',
                checked: true,
            },
            {
                title: 'Criar sua primeira rádio',
                description: '',
                path: {
                    'url': 'modulos?pag=minhas-radios',
                    'title': 'Minhas rádios'
                },
                checked: false,
            },
            {
                title: 'Configurar seu domínio',
                description: '',
                path: {
                    'url': 'modulos?pag=dominios',
                    'title': 'Meus domínios'
                },
                checked: false,
            },
            {
                title: 'Personalizar sua rádio',
                description: '',
                path: {
                    'url': 'modulos?pag=configuracoes',
                    'title': 'Configurações'
                },
                checked: false,
            },
            {
                title: 'Faturar alto!',
                description: '',
                checked: false,
            },
        ]

        const paymentsPeriods = {
            data: [0, 0, 0, 0, 0, 0],
            categories: ['Out/2024', 'Nov/2024', 'Dez/2024', 'Jan/2025', 'Fev/2025', 'Mar/2025'],
        }

        return (
            <div className="grid gap-5 lg:gap-7.5">

                <EntryCallout className="h-full" />

                <div className="grid lg:grid-cols-3 gap-y-5 lg:gap-7.5 items-stretch">

                    <div className="lg:col-span-1">

                        <ReportSettings 
                            className="h-full" 
                            title="Falta muito pouco!"
                            items={itemsReport}
                            position="left"
                        />

                    </div>
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-2 gap-5 lg:gap-7.5 h-full items-stretch">
                            <ChannelStats
                                title="Canais"
                                items={itemsChannel}
                            />
                        </div>
                    </div>

                </div>

                <div className="grid lg:grid-cols-3 gap-y-5 lg:gap-7.5 items-stretch">

                    <div className="lg:col-span-2">
                        <div className="grid md:grid-cols-2 gap-5 lg:gap-7.5 h-full items-stretch">
                            <Options />
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <MyBalance 
                            className="h-full" 
                            periods={paymentsPeriods}
                        />
                    </div>

                </div>

            </div>
        )

    }

    export { DashboardContext }
