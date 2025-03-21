    import { useState } from 'react'
    import ApexChart from 'react-apexcharts'
    import { KeenIcon, Menu, MenuItem, MenuToggle } from '@/components'
    import clsx from 'clsx'
    import { useLanguage } from '@/i18n'
    import { DropdownCard2 } from '@/partials/dropdowns/general'

    const MyBalance = ({ className, periods }) => {

        const [activePeriod, setActivePeriod] = useState('Hoje')
        const { isRTL }                       = useLanguage()

        const { data, categories } = periods;

        const options = {
            series: [
                {
                    name: 'series1',
                    data: data,
                },
            ],
            chart: {
                height: 250,
                type: 'area',
                toolbar: {
                    show: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: false,
            },
            stroke: {
                curve: 'smooth',
                show: true,
                width: 3,
                colors: ['var(--tw-primary)'],
            },
            xaxis: {
                categories: categories,
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                labels: {
                    style: {
                        colors: 'var(--tw-gray-600)',
                        fontSize: '12px',
                    },
                },
                crosshairs: {
                    position: 'front',
                    stroke: {
                        color: 'var(--tw-primary)',
                        width: 1,
                        dashArray: 3,
                    },
                },
                tooltip: {
                    enabled: false,
                    formatter: undefined,
                    offsetY: 0,
                    style: {
                        fontSize: '12px',
                    },
                },
            },
            yaxis: {
                min: 0,
                max: 100,
                tickAmount: 5,
                axisTicks: {
                    show: false,
                },
                labels: {
                    style: {
                        colors: 'var(--tw-gray-600)',
                        fontSize: '12px',
                    },
                    formatter: (value) => {
                        return `$${value}K`
                    },
                },
            },
            tooltip: {
                enabled: true,
                custom({ series, seriesIndex, dataPointIndex, w }) {
                    
                    const number = parseInt(series[seriesIndex][dataPointIndex]) * 1000;
                    const Mês = w.globals.seriesX[seriesIndex][dataPointIndex];
                    const MêsName = categories[Mês];

                    const formatter = new Intl.NumberFormat('pt-br', {
                        style: 'currency',
                        currency: 'BRL',
                    })

                    const formattedNumber = formatter.format(number)

                    return `
                    <div class="flex flex-col gap-2 p-3.5">
                        <div class="font-medium text-2sm text-gray-600">${MêsName}</div>
                        <div class="flex items-center gap-1.5">
                            <div class="font-semibold text-md text-gray-900">${formattedNumber}</div>
                        </div>
                    </div>
                    `
                },
            },
            markers: {
                size: 0,
                colors: 'var(--tw-primary-light)',
                strokeColors: 'var(--tw-primary)',
                strokeWidth: 4,
                strokeOpacity: 1,
                strokeDashArray: 0,
                fillOpacity: 1,
                discrete: [],
                shape: 'circle',
                offsetX: 0,
                offsetY: 0,
                onClick: undefined,
                onDblClick: undefined,
                showNullDataPoints: true,
                hover: {
                    size: 8,
                    sizeOffset: 0,
                },
            },
            fill: {
                gradient: {
                    opacityFrom: 0.25,
                    opacityTo: 0,
                },
            },
            grid: {
                borderColor: 'var(--tw-gray-200)',
                strokeDashArray: 5,
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
            },
        }
        
        return (
            <div className={`card ${clsx(className && className)}`}>

                <div className="card-header">

                    <h3 className="card-title">Pagamentos</h3>

                    <Menu className="items-stretch">

                        <MenuItem
                            toggle="dropdown"
                            trigger="click"
                            dropdownProps={{
                                placement: isRTL() ? 'bottom-start' : 'bottom-end',
                                modifiers: [
                                    {
                                        name: 'offset',
                                        options: {
                                            offset: isRTL() ? [0, -10] : [0, 10], // [skid, distance]
                                        },
                                    },
                                ],
                            }}
                        >

                            <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                                <KeenIcon icon="dots-vertical" />
                            </MenuToggle>

                            {DropdownCard2()}

                        </MenuItem>

                    </Menu>
                </div>

                <div className="card-body flex flex-col gap-2 px-5 lg:px-7.5 pt-5">

                    <span className="text-2sm font-normal text-gray-800">
                        Últimos 6 meses
                    </span>
                    <span className="text-3xl font-semibold text-gray-900 mb-3">
                        R$0,00
                    </span>
                </div>

                <ApexChart
                    id="my_balance_chart"
                    options={options}
                    series={options.series}
                    type="area"
                    max-width="361"
                    height="250"
                    className="px-3"
                />

            </div>

        )
    }
    export { MyBalance }
