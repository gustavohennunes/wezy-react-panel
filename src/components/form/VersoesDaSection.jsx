    import { useMemo, useState } from 'react'
    import clsx from 'clsx'
    import { toast } from 'sonner'
    import { KeenIcon } from '@/components/keenicons'
    import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
    import { api } from '@/services/api'
    import { buildApiUrl } from '@/utils/urlHelper'
    import { diffDeLinhas, comContexto } from '@/utils/diffDeLinhas'
    import { criaMontadorLegado } from '@/components/legacy/criaMontadorLegado'

    // VERSÕES DO CAMPO "Conteúdo" DA SECTION (?pag=projetos-paginas-sections): O EDITOR TEM HTML, CSS E JS NO MESMO uso_livre
    // E CADA SAVE GUARDA UMA VERSÃO (registraVersaoSection NO CARTÃO). AQUI DÁ PARA VER CADA VERSÃO, COMPARAR (DIFF COMO O
    // git diff) COM O QUE ESTÁ NO EDITOR OU COM A VERSÃO ANTERIOR, E RESTAURAR UMA ÁREA NO EDITOR — O SAVE CONTINUA O NORMAL
    // DO FORMULÁRIO (QUE TAMBÉM REGERA O component_processed). O CARTÃO MARCA O LUGAR COM <div data-versoes-section="ID">

    const AREAS = [
        { chave: 'html', titulo: 'HTML', area: 'principal' },
        { chave: 'css', titulo: 'CSS', area: 'css' },
        { chave: 'js', titulo: 'JS', area: 'js' },
    ]

    //CONTEÚDO DE UMA ÁREA NO EDITOR AGORA: A ÁREA ABERTA ESTÁ NO ACE (window.editor), AS OUTRAS NOS HIDDEN .conteudo-area
    const conteudoNoEditor = (area) => {
        if (document.querySelector('#elemento-atual')?.value === area && window.editor?.getSession) {
            return window.editor.getSession().getValue()
        }
        return document.querySelector(`.conteudo-area[data-area="${area}"]`)?.value ?? ''
    }

    const restauraNoEditor = (area, texto) => {
        const hidden = document.querySelector(`.conteudo-area[data-area="${area}"]`)
        if (hidden) {
            hidden.value = texto
            hidden.dispatchEvent(new Event('input', { bubbles: true }))
        }
        if (document.querySelector('#elemento-atual')?.value === area && window.editor?.getSession) {
            window.editor.getSession().setValue(texto)
        }
    }

    const MARCA_DA_LINHA = { igual: ' ', removida: '-', adicionada: '+' }

    const ClasseDaLinha = {
        igual: 'text-gray-700',
        removida: 'bg-danger-light text-danger',
        adicionada: 'bg-success-light text-success',
    }

    const DiffView = ({ linhas, inteiro }) => {

        const visiveis = useMemo(() => (inteiro ? linhas : comContexto(linhas)), [linhas, inteiro])

        if (!linhas.some((linha) => linha.tipo !== 'igual')) {
            return <div className="px-4 py-10 text-center text-2sm text-gray-600">Sem diferenças.</div>
        }

        return (
            <table className="w-full border-collapse font-mono text-xs leading-5">
                <tbody>
                    {visiveis.map((linha, indice) =>
                        linha.tipo === 'oculto' ? (
                            <tr key={indice} className="bg-gray-100 text-gray-500">
                                <td colSpan={4} className="px-3 py-0.5 text-center">{`⋯ ${linha.quantidade} linha${linha.quantidade > 1 ? 's' : ''} sem alteração`}</td>
                            </tr>
                        ) : (
                            <tr key={indice} className={ClasseDaLinha[linha.tipo]}>
                                <td className="w-10 select-none border-e border-gray-200 px-1.5 text-end align-top text-gray-500">{linha.antes ?? ''}</td>
                                <td className="w-10 select-none border-e border-gray-200 px-1.5 text-end align-top text-gray-500">{linha.depois ?? ''}</td>
                                <td className="w-5 select-none px-1 text-center align-top">{MARCA_DA_LINHA[linha.tipo]}</td>
                                <td className="whitespace-pre-wrap break-all pe-3 align-top">{linha.texto || ' '}</td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
        )

    }

    const VersoesDaSection = ({ elemento }) => {

        const idSection = elemento.getAttribute('data-versoes-section')

        const [aberto, setAberto]         = useState(false)
        const [carregando, setCarregando] = useState(false)
        const [versoes, setVersoes]       = useState(null)
        const [selecionada, setSelecionada] = useState(0)
        const [aba, setAba]               = useState('html')
        const [comparar, setComparar]     = useState('editor')
        const [inteiro, setInteiro]       = useState(false)
        //CONTEÚDO DO EDITOR LIDO AO ABRIR (O EDITOR NÃO MUDA COM O MODAL ABERTO)
        const [noEditor, setNoEditor]     = useState({})

        const abre = async () => {

            setAberto(true)
            setNoEditor(Object.fromEntries(AREAS.map(({ chave, area }) => [chave, conteudoNoEditor(area)])))
            setCarregando(true)

            try {
                const params = new URLSearchParams(window.location.search)
                params.set('acao', 'versoes-conteudo')
                params.set('id', idSection)
                const resposta = await api.get(buildApiUrl(params))
                const dados    = resposta.data?.success?.response?.data ?? resposta.data
                setVersoes(Array.isArray(dados?.versions) ? dados.versions : [])
                setSelecionada(0)
            } catch {
                setVersoes(null)
                toast.error('Não foi possível carregar as versões.')
            } finally {
                setCarregando(false)
            }

        }

        const versao   = versoes?.[selecionada]
        const anterior = versoes?.[selecionada + 1]
        const areaAtual = AREAS.find((item) => item.chave === aba)

        //"editor": O QUE MUDA SE RESTAURAR ESTA VERSÃO (EDITOR -> VERSÃO). "anterior": O QUE ESTE SAVE MUDOU (ANTERIOR -> VERSÃO)
        const linhas = useMemo(() => {
            if (!versao) return []
            const base = comparar === 'editor' ? noEditor[aba] ?? '' : anterior?.areas?.[aba] ?? ''
            return diffDeLinhas(base, versao.areas?.[aba] ?? '')
        }, [versao, anterior, aba, comparar, noEditor])

        const adicionadas = linhas.filter((linha) => linha.tipo === 'adicionada').length
        const removidas   = linhas.filter((linha) => linha.tipo === 'removida').length

        //ABA QUE MUDOU NESTA VERSÃO (PARA MARCAR NA LISTA E NAS ABAS)
        const mudou = (atual, outra, chave) => (atual?.areas?.[chave] ?? '') !== (outra?.areas?.[chave] ?? '')

        const restaura = () => {
            restauraNoEditor(areaAtual.area, versao.areas?.[aba] ?? '')
            setAberto(false)
            toast.success(`${areaAtual.titulo} da versão de ${versao.date} restaurado no editor. Salve a section para aplicar.`)
        }

        return (
            <>
                <button type="button" className="btn btn-sm btn-light gap-1.5" onClick={abre}>
                    <KeenIcon icon="time" className="text-sm" />
                    Ver versões do HTML, CSS e JS
                </button>

                <Dialog open={aberto} onOpenChange={setAberto}>
                    <DialogContent className="flex max-h-[90vh] w-[calc(100vw-32px)] max-w-6xl flex-col p-0">

                        <DialogHeader className="px-5">
                            <DialogTitle>Versões do conteúdo</DialogTitle>
                            <DialogDescription className="sr-only">Versões salvas do HTML, CSS e JS da section, com comparação</DialogDescription>
                        </DialogHeader>

                        <DialogBody className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-5 md:flex-row">

                            {carregando && <div className="w-full py-10 text-center text-2sm text-gray-600">Carregando versões…</div>}

                            {!carregando && versoes?.length === 0 && (
                                <div className="w-full py-10 text-center text-2sm text-gray-600">
                                    Nenhuma versão salva ainda. A partir de agora, cada vez que a section for salva, uma versão fica guardada aqui.
                                </div>
                            )}

                            {!carregando && versao && (
                                <>
                                    {/* LISTA DE VERSÕES: A MAIS NOVA EM CIMA (= O QUE ESTÁ SALVO HOJE) */}
                                    <ul className="flex max-h-48 shrink-0 flex-col gap-1 overflow-y-auto md:max-h-none md:w-60">
                                        {versoes.map((item, indice) => (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelecionada(indice)}
                                                    className={clsx(
                                                        'flex w-full flex-col items-start rounded-md border px-3 py-2 text-start',
                                                        indice === selecionada ? 'border-primary bg-primary-light' : 'border-gray-200 hover:bg-gray-100'
                                                    )}
                                                >
                                                    <span className={clsx('text-2sm font-semibold', indice === selecionada ? 'text-primary' : 'text-gray-900')}>
                                                        {item.date}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        {indice === 0 ? 'Salva atualmente' : item.user || 'Usuário não identificado'}
                                                    </span>
                                                    <span className="mt-1 flex gap-1">
                                                        {AREAS.filter(({ chave }) => mudou(item, versoes[indice + 1], chave)).map(({ chave, titulo }) => (
                                                            <span key={chave} className="badge badge-sm badge-outline">{titulo}</span>
                                                        ))}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">

                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="flex gap-1" role="tablist">
                                                {AREAS.map(({ chave, titulo }) => (
                                                    <button
                                                        key={chave}
                                                        type="button"
                                                        role="tab"
                                                        aria-selected={aba === chave}
                                                        onClick={() => setAba(chave)}
                                                        className={clsx('btn btn-sm', aba === chave ? 'btn-primary' : 'btn-light')}
                                                    >
                                                        {titulo}
                                                    </button>
                                                ))}
                                            </div>

                                            <select
                                                className="select select-sm ms-auto w-auto"
                                                value={comparar}
                                                onChange={(e) => setComparar(e.target.value)}
                                                aria-label="Comparar com"
                                            >
                                                <option value="editor">Comparar com o editor atual</option>
                                                <option value="anterior">Comparar com a versão anterior</option>
                                            </select>

                                            <label className="flex items-center gap-1.5 text-2sm text-gray-700">
                                                <input type="checkbox" className="checkbox checkbox-sm" checked={inteiro} onChange={(e) => setInteiro(e.target.checked)} />
                                                Arquivo inteiro
                                            </label>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-gray-600">
                                            <span className="font-semibold text-success">+{adicionadas}</span>
                                            <span className="font-semibold text-danger">−{removidas}</span>
                                            <span>
                                                {comparar === 'editor'
                                                    ? 'Verde: entra no editor ao restaurar. Vermelho: sai do editor.'
                                                    : anterior ? `Mudanças desde a versão de ${anterior.date}.` : 'Primeira versão guardada.'}
                                            </span>
                                        </div>

                                        <div className="min-h-[240px] flex-1 overflow-auto rounded-md border border-gray-200">
                                            <DiffView linhas={linhas} inteiro={inteiro} />
                                        </div>

                                    </div>
                                </>
                            )}

                        </DialogBody>

                        {!carregando && versao && (
                            <DialogFooter className="flex flex-wrap items-center justify-between gap-2 px-5">
                                <span className="text-xs text-gray-600">Restaurar coloca a versão no editor; salve a section para aplicar.</span>
                                <div className="flex gap-2">
                                    <button type="button" className="btn btn-light" onClick={() => setAberto(false)}>Fechar</button>
                                    <button type="button" className="btn btn-primary" onClick={restaura} disabled={(noEditor[aba] ?? '') === (versao.areas?.[aba] ?? '')}>
                                        {`Restaurar ${areaAtual.titulo} desta versão`}
                                    </button>
                                </div>
                            </DialogFooter>
                        )}

                    </DialogContent>
                </Dialog>
            </>
        )

    }

    const LegacyVersoesDaSection = criaMontadorLegado({
        seletor: '[data-versoes-section]',
        marcador: 'data-legacy-versoes',
        Componente: VersoesDaSection,
        substituir: true,
    })

    export { LegacyVersoesDaSection }
