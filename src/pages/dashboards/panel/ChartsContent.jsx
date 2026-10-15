    import { useMemo } from 'react'
    import Chart from 'react-apexcharts'
    import clsx from 'clsx'
    import { KeenIcon } from '@/components/keenicons'
    import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
    import { LegacyHtml } from '@/components/legacy/LegacyHtml'
    import { useSettings } from '@/providers'
    import './charts-content.css'

    // GRADE DE GRÁFICOS DOS CARTÕES COM $chartsConfig (framework/charts.php NO LEGADO). A API MANDA OS MESMOS CARDS
    // COMO DADOS EM params.charts (PanelModule::buildChartsData) E AQUI ELES VIRAM COMPONENTES: ApexCharts PARA
    // LINHA/BARRA/PIZZA, TILES PARA NÚMEROS E TABELA TAILWIND. CARD "html" (EX.: FILTRO DE DATAS) USA O LegacyHtml.

    //size DO $chartsConfig: 1 = 1/3, 2 = 2/3, 3 = LINHA INTEIRA, 4 = METADE (GRADE DE 6 COLUNAS)
    const LARGURA = {
        1: 'lg:col-span-2',
        2: 'lg:col-span-4',
        3: 'lg:col-span-6',
        4: 'lg:col-span-3',
    }

    //PALETA CATEGÓRICA VALIDADA (ORDEM FIXA, NUNCA CICLADA) — CLARO E ESCURO SÃO OS MESMOS MATIZES EM PASSOS DIFERENTES
    const SERIES_CLARO  = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948']
    const SERIES_ESCURO = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767']

    const numeroBR = (valor) => Number(valor || 0).toLocaleString('pt-BR')

    //"15/09/2026" NO EIXO VIRA "15/09" (O TOOLTIP MOSTRA A DATA INTEIRA)
    const rotuloCurto = (rotulo) => {
        const data = /^(\d{2}\/\d{2})\/\d{4}$/.exec(String(rotulo ?? ''))
        return data ? data[1] : rotulo
    }

    //CORES DO TEMA (VARIÁVEIS DO METRONIC) LIDAS NO RENDER: O APEX DESENHA EM SVG E NÃO ACEITA var() NOS ATRIBUTOS
    const corDoTema = (variavel, padrao) => {
        try {
            return getComputedStyle(document.documentElement).getPropertyValue(variavel).trim() || padrao
        } catch {
            return padrao
        }
    }

    const useTemaGrafico = () => {

        const { settings, getThemeMode } = useSettings()
        const modo = getThemeMode()

        return useMemo(() => ({
            modo,
            series: modo === 'dark' ? SERIES_ESCURO : SERIES_CLARO,
            texto:  corDoTema('--tw-gray-600', '#78829D'),
            grade:  corDoTema('--tw-gray-200', '#F1F1F4'),
            fundo:  corDoTema('--tw-card-background-color', '#ffffff'),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }), [modo, settings.themeMode])

    }

    const opcoesBase = (tema) => ({
        chart: {
            background: 'transparent',
            fontFamily: 'inherit',
            foreColor: tema.texto,
            toolbar: { show: false },
            zoom: { enabled: false },
            //SEM ANIMAÇÃO: COM A ABA EM SEGUNDO PLANO O APEX PODIA PARAR NO QUADRO INICIAL (LINHAS ZERADAS)
            animations: { enabled: false },
        },
        theme: { mode: tema.modo },
        colors: tema.series,
        grid: { borderColor: tema.grade, strokeDashArray: 0 },
        legend: { position: 'top', horizontalAlign: 'left', fontSize: '13px', markers: { width: 10, height: 10, radius: 10 }, itemMargin: { horizontal: 8 } },
        dataLabels: { enabled: false },
        tooltip: { theme: tema.modo },
    })

    const GraficoLinhaOuBarra = ({ card, tema }) => {

        const tipo = card.type === 'bar' ? 'bar' : 'line'
        const varias = (card.series || []).length > 1

        const options = {
            ...opcoesBase(tema),
            stroke: tipo === 'line' ? { width: 2, curve: 'straight' } : { width: 0 },
            markers: { size: 0, hover: { size: 5 } },
            plotOptions: { bar: { borderRadius: 4, borderRadiusApplication: 'end', columnWidth: '60%' } },
            legend: { ...opcoesBase(tema).legend, show: varias },
            xaxis: {
                categories: card.labels || [],
                //NO MÁXIMO ~12 RÓTULOS NO EIXO (31 DIAS EMBOLAVAM); O TOOLTIP MOSTRA CADA DIA
                tickAmount: Math.min(Math.max((card.labels || []).length - 1, 1), 12),
                tickPlacement: 'on',
                labels: { rotate: 0, hideOverlappingLabels: true, formatter: rotuloCurto },
                axisBorder: { color: tema.grade },
                axisTicks: { show: false },
                tooltip: { enabled: false },
            },
            yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (v) => numeroBR(Math.round(v)) } },
            tooltip: {
                ...opcoesBase(tema).tooltip,
                shared: true,
                intersect: false,
                x: { formatter: (_valor, { dataPointIndex }) => card.labels?.[dataPointIndex] ?? '' },
                y: { formatter: (v) => numeroBR(v) + (card.unit ? ' ' + card.unit : '') },
            },
        }

        const series = (card.series || []).map((serie) => ({ name: serie.name || card.title || 'Valor', data: serie.data || [] }))

        return <Chart type={tipo} height={320} series={series} options={options} />

    }

    const GraficoPizza = ({ card, tema }) => {

        const valores = card.series?.[0]?.data || []
        const total   = valores.reduce((soma, valor) => soma + Number(valor || 0), 0)
        const unidade = card.unit ? ' ' + card.unit : ''

        const options = {
            ...opcoesBase(tema),
            labels: card.labels || [],
            stroke: { width: 2, colors: [tema.fundo] },
            legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '13px', markers: { width: 10, height: 10, radius: 10 }, itemMargin: { horizontal: 8, vertical: 4 } },
            dataLabels: {
                enabled: true,
                formatter: (percentual) => Math.round(percentual) + '%',
                dropShadow: { enabled: false },
                style: { fontSize: '12px', fontWeight: 600 },
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '62%',
                        labels: {
                            show: true,
                            value: { fontSize: '22px', fontWeight: 600, color: corDoTema('--tw-gray-900', '#071437'), formatter: (v) => numeroBR(v) },
                            total: { show: true, label: 'Total', fontSize: '12px', color: tema.texto, formatter: () => numeroBR(total) },
                        },
                    },
                },
            },
            tooltip: {
                ...opcoesBase(tema).tooltip,
                y: { formatter: (v) => numeroBR(v) + unidade + (total > 0 ? ` (${Math.round((v * 100) / total)}%)` : '') },
            },
        }

        if (total === 0) {
            return <p className="text-2sm text-gray-500 py-10 text-center">Sem dados no período.</p>
        }

        return <Chart type="donut" height={320} series={valores} options={options} />

    }

    const Numeros = ({ card }) => (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
            {(card.items || []).map((item, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-light px-4 py-3.5">
                    <div className="text-2sm text-gray-600 mb-1">{item.label}</div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl font-semibold text-gray-900 leading-tight">{item.value}</span>
                        {item.trend && (
                            <span
                                className="rounded-full px-2 py-0.5 text-2xs font-medium"
                                style={item.color ? { color: item.color, backgroundColor: item.color + '1A' } : undefined}
                            >
                                {item.trend}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )

    //CÉLULA: TEXTO SIMPLES OU { text, align, color, badge, bold }. O TEXTO VEM DO CARTÃO JÁ ESCAPADO (htmlspecialchars)
    //E PODE TER HTML (LINKS), COMO NO LEGADO — POR ISSO VAI COMO HTML
    const celula = (valor) => (valor !== null && typeof valor === 'object' ? valor : { text: valor })

    const ALINHAMENTO = { left: 'text-left', center: 'text-center', right: 'text-right' }

    const Tabela = ({ card }) => {

        const headers = card.headers || []
        const rows    = card.rows || []

        if (rows.length === 0) {
            return <p className="text-2sm text-gray-500 py-10 text-center">Sem dados no período.</p>
        }

        return (
            <div className="overflow-x-auto -mx-1">
                <table className="w-full text-2sm">
                    {headers.length > 0 && (
                        <thead>
                            <tr className="border-b border-gray-200">
                                {headers.map((h, i) => {
                                    const c = celula(h)
                                    return (
                                        <th
                                            key={i}
                                            className={clsx('px-3 pb-2.5 font-medium text-gray-600', ALINHAMENTO[c.align] || 'text-left')}
                                            style={c.width ? { width: /^\d+$/.test(String(c.width)) ? c.width + 'px' : c.width } : undefined}
                                            dangerouslySetInnerHTML={{ __html: String(c.text ?? '') }}
                                        />
                                    )
                                })}
                            </tr>
                        </thead>
                    )}
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className="border-b border-gray-100 last:border-b-0">
                                {(Array.isArray(row) ? row : Object.values(row || {})).map((v, j) => {
                                    const c = celula(v)
                                    const texto = <span dangerouslySetInnerHTML={{ __html: String(c.text ?? '') }} />
                                    return (
                                        <td
                                            key={j}
                                            className={clsx('px-3 py-2.5 text-gray-800 tabular-nums', ALINHAMENTO[c.align] || 'text-left', c.bold && 'font-semibold text-gray-900')}
                                            style={c.color && !c.badge ? { color: c.color } : undefined}
                                        >
                                            {c.badge ? (
                                                //BADGE DO METRONIC (badge-pill); border-0, px-2/py-0.5 E leading-3 MANTÊM O TAMANHO DE ANTES,
                                                //E SEM COR DO CARTÃO FICA SEM FUNDO, COMO ERA
                                                <span
                                                    className={clsx('badge badge-pill border-0 px-2 py-0.5 leading-3', !c.color && 'bg-transparent text-current')}
                                                    style={c.color ? { color: c.color, backgroundColor: c.color + '1A' } : undefined}
                                                >
                                                    {texto}
                                                </span>
                                            ) : texto}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )

    }

    const Conteudo = ({ card, tema }) => {
        switch (card.type) {
            case 'line':
            case 'bar':
                return <GraficoLinhaOuBarra card={card} tema={tema} />
            case 'pie':
                return <GraficoPizza card={card} tema={tema} />
            case 'numbers':
                return <Numeros card={card} />
            case 'table':
                return <Tabela card={card} />
            case 'html':
                return <LegacyHtml html={card.html} className="chart-html" />
            default:
                return null
        }
    }

    const ChartsContent = ({ cards }) => {

        const tema = useTemaGrafico()

        return (
            <TooltipProvider delayDuration={150}>
                <div className="legacy-charts grid grid-cols-1 lg:grid-cols-6 gap-5">
                    {cards.map((card, i) => (
                        <section key={i} className={clsx('card min-w-0', LARGURA[card.size] || LARGURA[1])}>

                            {(card.title || card.description) && (
                                <div className="card-header min-h-0 py-3.5">
                                    <h3 className="card-title flex items-center gap-1.5 text-sm">
                                        {card.title}
                                        {card.description && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button type="button" className="inline-flex text-gray-500 hover:text-primary" aria-label={`Sobre: ${card.title || 'este relatório'}`}>
                                                        <KeenIcon icon="information-2" className="text-base" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[320px] whitespace-pre-line text-2sm leading-relaxed">
                                                    {card.description}
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </h3>
                                </div>
                            )}

                            <div className="card-body py-4">
                                <Conteudo card={card} tema={tema} />
                            </div>

                        </section>
                    ))}
                </div>
            </TooltipProvider>
        )

    }

    export { ChartsContent }
