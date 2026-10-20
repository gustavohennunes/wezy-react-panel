    import { useState } from 'react'
    import { KeenIcon } from '@/components/keenicons'
    import { useConfirm } from '@/components/ui/confirm-dialog'

    import { arquivosRemovidos } from './arquivosRemovidos'

    const extensoesDeImagem = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif', 'ico']

    //NOME DO ARQUIVO SALVO (ÚLTIMO PEDAÇO DA URL, SEM QUERY), COMO O conteudo-arq DO retornaFile NO PAINEL ANTIGO
    const nomeDoArquivo = (url) => {
        const ultimo = String(url).split(/[?#]/)[0].split('/').filter(Boolean).pop() || String(url)
        try {
            return decodeURIComponent(ultimo)
        } catch {
            return ultimo
        }
    }

    //rotulo: TÍTULO DA LINHA (O <label htmlFor> FICA NO FormInput)
    const FormFile = ({ id, multiple, accept, maxSize, onFilesChange, fieldName, value, fieldClass = '', fieldData = {}, required = false, rotulo = 'Arquivo' }) => {
        const [selectedFiles, setSelectedFiles] = useState([])
        const [error, setError] = useState(null)

        //REMOVER O ARQUIVO JÁ SALVO, COMO O ✕ (.limpar) DO retornaFile NO PAINEL ANTIGO: MANDA del<campo>=ok NO SUBMIT E O
        //fotoInsert (includes/config.php) GRAVA O CAMPO VAZIO. SÓ VALE AO SALVAR O FORMULÁRIO
        const [removido, setRemovido] = useState(false)
        const [confirm, confirmDialog] = useConfirm()

        const removerArquivo = async () => {
            const confirmou = await confirm({
                title: 'Remover arquivo?',
                description: 'O arquivo atual sai deste campo ao salvar o formulário.',
                confirmText: 'Remover',
                cancelText: 'Cancelar',
            })
            if (confirmou) {
                setRemovido(true)
                arquivosRemovidos.add(fieldName)
            }
        }

        const handleFileChange = (event) => {

            const files = Array.from(event.target.files)

            if (maxSize && files.some((file) => file.size > maxSize)) {
                setError(`Um ou mais arquivos excedem o tamanho máximo permitido.`)
                return
            }

            setSelectedFiles(files)
            setError(null)
            //ARQUIVO NOVO ESCOLHIDO: O UPLOAD SUBSTITUI O ANTIGO, NÃO PRECISA MAIS DO del
            if (files.length > 0) {
                setRemovido(false)
                arquivosRemovidos.delete(fieldName)
            }
            if (onFilesChange) {
                onFilesChange(files)
            }

        }

        const getFileInputClassName = () => {

            let className = 'file-input'

            if (error) {
                className += ' border-danger'
            } else if (selectedFiles.length > 0) {
                className += ' border-success'
            }

            return className

        }

        const nome = value ? nomeDoArquivo(value) : ''
        const mostraMiniatura = extensoesDeImagem.includes(nome.split('.').pop().toLowerCase())

        return (
            <div className="w-full">

                {value && !removido && (
                    <div className="mb-2 flex items-center gap-2">
                        {mostraMiniatura ? (
                            //MINIATURA COM PRÉVIA AMPLIADA NO HOVER (COMO O verFoto DAS LISTAGENS E O BANCO DE IMAGENS DO LEGADO).
                            //object-contain: LOGO LARGO (ex.: 190x43) NÃO É CORTADO. O CLIQUE ABRE A IMAGEM EM OUTRA ABA
                            <div className="group relative shrink-0">
                                <a href={value} target="_blank" rel="noopener noreferrer" title="Abrir imagem em nova aba" className="block">
                                    <img src={value} alt="Imagem atual" className="size-10 rounded-lg border border-gray-200 bg-gray-100 object-contain" />
                                </a>
                                <div className="pointer-events-none invisible absolute left-12 top-1/2 z-50 -translate-y-1/2 rounded-lg border border-gray-200 bg-[var(--tw-card-background-color,var(--tw-light))] p-2 opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
                                    <img src={value} alt="" className="block max-h-[240px] max-w-[320px] min-w-16 bg-gray-100 object-contain" />
                                </div>
                            </div>
                        ) : (
                            //PDF, DOC, CSV... (CAMPO Arq): SEM MINIATURA, SÓ O ÍCONE DE DOCUMENTO
                            <a href={value} target="_blank" rel="noopener noreferrer" title="Abrir arquivo em nova aba" className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-gray-600">
                                <KeenIcon icon="document" className="text-lg" />
                            </a>
                        )}
                        {/* NOME DO ARQUIVO SALVO: COR E SUBLINHADO NO HOVER PARA MOSTRAR QUE É CLICÁVEL */}
                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={value}
                            className="min-w-0 max-w-xs truncate text-2sm font-medium text-primary underline-offset-[3px] hover:text-primary-active hover:underline"
                        >
                            {nome}
                        </a>
                        {/* SEM CONDIÇÃO DE multiple: A API MANDA multiple ATÉ EM CAMPO DE UM ARQUIVO SÓ (ex.: LOGOTIPO DO CLIENTE) */}
                        <button type="button" onClick={removerArquivo} className="btn btn-sm btn-light text-danger gap-1">
                            <KeenIcon icon="trash" />
                            Remover
                        </button>
                    </div>
                )}

                {value && removido && (
                    <div className="mb-2 flex items-center gap-2 text-2sm text-gray-600">
                        <span>Arquivo será removido ao salvar.</span>
                        <button type="button" onClick={() => { setRemovido(false); arquivosRemovidos.delete(fieldName) }} className="btn btn-link btn-sm">
                            Desfazer
                        </button>
                    </div>
                )}


                <input
                    id={id}
                    aria-label={rotulo}
                    name={fieldName}
                    className={
                        getFileInputClassName() + `${fieldClass} ${fieldData.class}`
                    }
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    required={required}
                    onChange={handleFileChange}
                />

                {confirmDialog}

            </div>
        )

    }

    export { FormFile }
