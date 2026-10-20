    import { useRef, useState } from 'react'
    import { toast } from 'sonner'
    import clsx from 'clsx'
    import { KeenIcon } from '@/components/keenicons'
    import { enviarFotos, mensagemErro } from './galeriaApi'

    // ENVIO DE FOTOS: ARRASTAR PARA A ÁREA OU ESCOLHER NO COMPUTADOR, COM LINK E LEGENDA QUANDO O CARTÃO PEDE.
    // onEnviado RECEBE A GALERIA DA RESPOSTA (OU null, E A GALERIA SE RECARREGA SOZINHA)
    const EnvioDeFotos = ({ data, onEnviado }) => {

        const [arquivos, setArquivos] = useState([])
        const [enviando, setEnviando] = useState(false)
        const [soltando, setSoltando] = useState(false)
        const [link, setLink]         = useState('')
        const [legenda, setLegenda]   = useState('')
        const inputArquivos           = useRef(null)
        //O SEGUNDO Enter/CLIQUE PODE CHEGAR ANTES DO setEnviando VALER
        const emAndamento             = useRef(false)

        const escolher = (lista) => {
            const imagens = Array.from(lista || []).filter((arquivo) => arquivo.type.startsWith('image/'))
            if (imagens.length !== (lista?.length || 0)) {
                toast.warning('Só imagens podem ser enviadas — os outros arquivos foram ignorados.')
            }
            setArquivos(imagens)
        }

        const limpar = () => {
            setArquivos([])
            setLink('')
            setLegenda('')
            if (inputArquivos.current) inputArquivos.current.value = ''
        }

        const enviar = async (e) => {

            e.preventDefault()

            if (emAndamento.current) return

            if (arquivos.length === 0 && !(data?.link && link)) {
                toast.warning('Escolha ao menos uma imagem.')
                return
            }

            emAndamento.current = true
            setEnviando(true)

            try {

                const galeria = await enviarFotos({ arquivos, link, legenda, comLink: Boolean(data?.link), comLegenda: Boolean(data?.caption) })

                if (galeria?.message?.type === 'error') {
                    mensagemErro(galeria.message.text)
                } else if (galeria) {
                    toast.success(galeria.message?.text || 'Fotos enviadas.')
                }

                await onEnviado(galeria)
                limpar()

            } catch (error) {
                mensagemErro(error?.response?.data?.error?.message || 'Não foi possível enviar as fotos.')
            } finally {
                emAndamento.current = false
                setEnviando(false)
            }

        }

        return (
            <form className="card" onSubmit={enviar}>
                <div className="card-body grid gap-4">

                    <div
                        className={clsx(
                            'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-5 py-7 text-center transition-colors',
                            soltando ? 'border-primary bg-primary-light' : 'border-gray-300 bg-light'
                        )}
                        onDragOver={(e) => { e.preventDefault(); setSoltando(true) }}
                        onDragLeave={() => setSoltando(false)}
                        onDrop={(e) => { e.preventDefault(); setSoltando(false); escolher(e.dataTransfer.files) }}
                    >
                        <KeenIcon icon="picture" className="text-3xl text-gray-500" />
                        <div className="text-sm font-medium text-gray-900">Arraste as imagens para cá</div>
                        <div className="text-2sm text-gray-600">
                            ou{' '}
                            <button type="button" className="font-medium text-primary hover:underline" onClick={() => inputArquivos.current?.click()}>
                                escolha no computador
                            </button>
                        </div>
                        {data?.recommended && (
                            <div className="text-2xs text-gray-500">Tamanho recomendado: {data.recommended}</div>
                        )}
                        <input
                            ref={inputArquivos}
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            aria-label="Escolher imagens"
                            onChange={(e) => escolher(e.target.files)}
                        />
                    </div>

                    {arquivos.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-2sm text-gray-700">
                            <KeenIcon icon="file-added" className="text-base text-primary" />
                            {arquivos.length === 1 ? arquivos[0].name : `${arquivos.length} imagens selecionadas`}
                            <button type="button" className="text-gray-500 hover:text-danger" onClick={() => setArquivos([])} aria-label="Limpar seleção de arquivos">
                                <KeenIcon icon="cross" className="text-sm" />
                            </button>
                        </div>
                    )}

                    {(data?.link || data?.caption) && (
                        <div className="grid gap-3 sm:grid-cols-2 max-w-[700px]">
                            {data?.link && (
                                <label className="grid gap-1.5 text-2sm font-medium text-gray-800">
                                    Link
                                    <input className="input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
                                </label>
                            )}
                            {data?.caption && (
                                <label className="grid gap-1.5 text-2sm font-medium text-gray-800">
                                    Legenda
                                    <input className="input" value={legenda} onChange={(e) => setLegenda(e.target.value)} />
                                </label>
                            )}
                        </div>
                    )}

                    <div>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={enviando}>
                            <KeenIcon icon={enviando ? 'loading' : 'cloud-add'} className={clsx('!text-sm', enviando && 'animate-spin')} />
                            {enviando ? 'Enviando…' : 'Enviar'}
                        </button>
                    </div>

                </div>
            </form>
        )

    }

    export { EnvioDeFotos }
