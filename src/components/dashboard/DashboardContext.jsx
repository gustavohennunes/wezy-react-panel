    import { useMemo, useState } from 'react'
    import { Link } from 'react-router-dom'
    import clsx from 'clsx'
    import { KeenIcon } from '@/components/keenicons'
    import { Skeleton } from '@/components/ui/skeleton'
    import { OldIcon } from '@/components/legacy/OldIcon'
    import { useAuth } from '@/auth/providers/JWTProvider'
    import * as authHelper from '@/auth/_helpers'
    import { useMenus } from '@/providers'
    import { iconeDoMenu } from '@/lib/transformOldIcon'
    import { getCustomerHost } from '@/utils/customerHost'
    import { lerRecentes } from '@/utils/modulosRecentes'
    import { lerUsoDeDisco, tamanhoLegivel } from '@/utils/usoDeDisco'
    import { BarraDeUso } from '@/components/ui/barra-de-uso'

    // INÍCIO DO PAINEL (?pag=dashboard). SÓ DADOS QUE O FRONT JÁ TEM — USUÁRIO LOGADO, MENU (panel/menus), MÓDULO
    // DESTAQUE E USO DE DISCO —, SEM CHAMADA EXTRA À API. O CONTEÚDO DE MODELO ANTIGO (RÁDIOS, PAGAMENTOS) SAIU

    const saudacao = () => {
        const hora = new Date().getHours()
        return hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
    }

    const paginaDe = (path) => /[?&]pag=([^&]+)/.exec(path || '')?.[1] || ''

    //MENU EM GRUPOS: CADA ITEM COM FILHOS VIRA UM GRUPO; OS ITENS SOLTOS DO TOPO FICAM JUNTOS EM "Geral"
    const agruparMenu = (main) => {

        const soltos = []
        const grupos = []

        ;(main || []).forEach((item) => {

            if (!item || item.heading || item.disabled || item.title === 'Dashboards') return

            const filhos = (item.children || []).filter((filho) => filho?.path)

            if (filhos.length > 0) {
                grupos.push({ titulo: item.title, itens: filhos })
            } else if (item.path) {
                soltos.push(item)
            }

        })

        return soltos.length > 0 ? [{ titulo: 'Geral', itens: soltos }, ...grupos] : grupos

    }

    const Atalho = ({ item, grupo }) => (
        <Link
            to={'/' + item.path}
            className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-light px-3 py-2.5 transition-colors hover:border-primary hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg text-gray-700 transition-colors group-hover:bg-primary group-hover:text-white">
                <OldIcon icon={iconeDoMenu(item)} />
            </span>
            <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-gray-900 first-letter:uppercase">{item.title}</span>
                {grupo && <span className="truncate text-2xs text-gray-600">{grupo}</span>}
            </span>
        </Link>
    )

    const Armazenamento = ({ uso }) => {

        const { percentual, barra, texto, aviso } = lerUsoDeDisco(uso)

        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title flex items-center gap-2">
                        <KeenIcon icon="cloud" className="text-lg text-gray-500" />
                        Armazenamento
                    </h3>
                </div>
                <div className="card-body flex flex-col gap-3">
                    <div className="flex items-end justify-between gap-2">
                        <span className="text-2xl font-semibold text-gray-900 tabular-nums">{tamanhoLegivel(uso.used)}</span>
                        <span className="text-sm text-gray-600 tabular-nums">de {tamanhoLegivel(uso.plan)}</span>
                    </div>
                    {percentual !== null && (
                        <>
                            <BarraDeUso percentual={percentual} classeDaBarra={barra} className="h-2" />
                            <span className={clsx('text-2sm', texto)}>
                                {percentual}% usado{aviso ? ` · ${aviso}` : ''}
                            </span>
                        </>
                    )}
                </div>
            </div>
        )

    }

    const BoasVindas = ({ usuario, destaque }) => {

        const dadosLogin   = authHelper.getAuth()?.data
        const painel       = dadosLogin?.cliente || dadosLogin?.dominio || getCustomerHost() || ''
        const primeiroNome = String(usuario?.nome || '').trim().split(/\s+/)[0]
        const hoje         = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

        return (
            <div className="card overflow-hidden">
                <div className="card-body flex flex-col gap-5 bg-gradient-to-r from-primary-light to-transparent p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
                    <div className="flex min-w-0 flex-col gap-1.5">
                        <span className="text-2sm font-medium text-gray-600 first-letter:uppercase">{hoje}</span>
                        <h1 className="text-2xl font-semibold leading-tight text-gray-900 lg:text-3xl">
                            {saudacao()}{primeiroNome ? `, ${primeiroNome}` : ''}
                        </h1>
                        {painel && (
                            <span className="flex items-center gap-1.5 text-sm text-gray-700">
                                <KeenIcon icon="home-2" className="text-base text-gray-500" />
                                <span className="truncate">Painel <span className="font-medium text-gray-900">{painel}</span></span>
                            </span>
                        )}
                    </div>

                    {destaque && (
                        <Link to={'/' + destaque.item.path} className="btn btn-primary shrink-0 gap-2 self-start sm:self-center">
                            <OldIcon icon={iconeDoMenu(destaque.item)} className="text-base" />
                            <span className="first-letter:uppercase">Abrir {destaque.item.title}</span>
                            <KeenIcon icon="arrow-right" className="text-base" />
                        </Link>
                    )}
                </div>
            </div>
        )

    }

    const filtrarGrupos = (grupos, termo) =>
        termo === ''
            ? grupos
            : grupos
                .map((grupo) => ({
                    ...grupo,
                    itens: grupo.itens.filter((item) => `${item.title} ${grupo.titulo}`.toLowerCase().includes(termo)),
                }))
                .filter((grupo) => grupo.itens.length > 0)

    const ESQUELETOS = ['a', 'b', 'c', 'd', 'e', 'f']

    //ACESSO RÁPIDO: TODOS OS MÓDULOS DO MENU, COM BUSCA. carregando = O MENU AINDA NÃO CHEGOU
    const AcessoRapido = ({ grupos, total, carregando }) => {

        const [busca, setBusca] = useState('')
        const termo = busca.trim().toLowerCase()
        const gruposFiltrados = filtrarGrupos(grupos, termo)

        return (
            <div className="card lg:col-span-2">
                <div className="card-header flex-wrap gap-3">
                    <h3 className="card-title">
                        Acesso rápido
                        {total > 0 && <span className="ms-2 text-sm font-normal text-gray-500 tabular-nums">{total}</span>}
                    </h3>
                    <label className="input input-sm w-full sm:w-56">
                        <KeenIcon icon="magnifier" className="!text-sm" />
                        <input
                            type="search"
                            placeholder="Buscar módulo"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            aria-label="Buscar módulo"
                        />
                    </label>
                </div>

                <div className="card-body flex flex-col gap-6">
                    {carregando && (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
                            {ESQUELETOS.map((chave) => (
                                <Skeleton key={chave} className="h-[58px] rounded-lg bg-gray-100" />
                            ))}
                        </div>
                    )}

                    {!carregando && gruposFiltrados.length === 0 && (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <KeenIcon icon="magnifier" className="text-3xl text-gray-400" />
                            <span className="text-sm text-gray-600">
                                {termo ? <>Nenhum módulo encontrado para “{busca.trim()}”.</> : 'Nenhum módulo liberado para o seu usuário.'}
                            </span>
                        </div>
                    )}

                    {gruposFiltrados.map((grupo) => (
                        <section key={grupo.titulo} className="flex flex-col gap-3">
                            {gruposFiltrados.length > 1 && (
                                <h4 className="text-2xs font-semibold uppercase tracking-wide text-gray-500 first-letter:uppercase">{grupo.titulo}</h4>
                            )}
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {grupo.itens.map((item) => (
                                    <Atalho key={item.path} item={item} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        )

    }

    const AbertosRecentemente = ({ recentes }) => (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title flex items-center gap-2">
                    <KeenIcon icon="time" className="text-lg text-gray-500" />
                    Abertos recentemente
                </h3>
            </div>
            <div className="card-body flex flex-col gap-2">
                {recentes.length === 0 ? (
                    <span className="text-2sm text-gray-600">
                        Os módulos que você abrir aparecem aqui para voltar com um clique.
                    </span>
                ) : (
                    recentes.map(({ item, grupo }) => <Atalho key={item.path} item={item} grupo={grupo} />)
                )}
            </div>
        </div>
    )

    //TODOS OS MÓDULOS (COM O GRUPO), PARA ACHAR DESTAQUE E RECENTES PELO pag
    const modulosPorPagina = (grupos) => {
        const mapa = new Map()
        grupos.forEach((grupo) => grupo.itens.forEach((item) => {
            const pag = paginaDe(item.path)
            if (pag && !mapa.has(pag)) mapa.set(pag, { item, grupo: grupo.titulo === 'Geral' ? '' : grupo.titulo })
        }))
        return mapa
    }

    const DashboardContext = () => {

        const { usuarioLogado } = useAuth()
        const { getMenuConfig } = useMenus()

        const menu      = getMenuConfig('primary')
        const grupos    = useMemo(() => agruparMenu(menu?.main), [menu])
        const porPagina = useMemo(() => modulosPorPagina(grupos), [grupos])

        const destaque = porPagina.get(menu?.highlight || menu?.structure?.highlight || '')
        const recentes = useMemo(() => lerRecentes().map((pag) => porPagina.get(pag)).filter(Boolean).slice(0, 5), [porPagina])

        const uso = menu?.usage

        return (
            <div className="flex flex-col gap-5 lg:gap-7.5">

                <BoasVindas usuario={usuarioLogado} destaque={destaque} />

                <div className="grid items-start gap-5 lg:grid-cols-3 lg:gap-7.5">

                    <AcessoRapido grupos={grupos} total={porPagina.size} carregando={!menu} />

                    {/* LATERAL: RECENTES E ARMAZENAMENTO */}
                    <div className="flex flex-col gap-5 lg:gap-7.5">
                        <AbertosRecentemente recentes={recentes} />
                        {uso?.used && <Armazenamento uso={uso} />}
                    </div>

                </div>

            </div>
        )

    }

    export { DashboardContext }
