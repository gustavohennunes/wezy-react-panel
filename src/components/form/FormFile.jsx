    import React, { useState } from 'react'
    import { KeenIcon } from '@/components/keenicons'
    import { useConfirm } from '@/components/ui/confirm-dialog'

    const FormFile = ({ id, multiple, accept, maxSize, onFilesChange, fieldName, value, fieldClass = '', fieldData = {}, required = false }) => {
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
            if (confirmou) setRemovido(true)
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
            if (files.length > 0) setRemovido(false)
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

        return (
            <div className="w-full">

                {value && !removido && (
                    <div className="mb-2 flex items-center gap-2">
                        <img src={value} alt="Imagem" className="w-10 h-10 object-cover rounded-lg" />
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
                        <button type="button" onClick={() => setRemovido(false)} className="btn btn-link btn-sm">
                            Desfazer
                        </button>
                    </div>
                )}

                {removido && <input type="hidden" name={'del' + fieldName} value="ok" />}

                <input
                    id={id}
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
