import { useCallback, useRef, useState } from 'react'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// CONFIRMAÇÃO EM PROMISE, NO LUGAR DO confirm() NATIVO QUE O PAINEL ANTIGO USAVA:
//   const [confirm, confirmDialog] = useConfirm()
//   if (!(await confirm({ title: 'Excluir?' }))) return
//   ...e renderizar {confirmDialog} no componente.
// OPÇÕES: title, description, confirmText, cancelText, confirmClass (PADRÃO btn-danger) E hideCancel (AVISO SÓ COM "OK")
const useConfirm = () => {

    //aberto SEPARADO DOS TEXTOS: O DIÁLOGO AINDA ANIMA A SAÍDA DEPOIS DE FECHAR. ZERAR AS OPÇÕES NO FECHAMENTO
    //TROCAVA O TEXTO PELO PADRÃO ("Tem certeza?") DURANTE A ANIMAÇÃO — AS OPÇÕES SÓ MUDAM NA PRÓXIMA ABERTURA
    const [aberto, setAberto] = useState(false)
    const [options, setOptions] = useState(null)
    const resolver = useRef(null)

    const confirm = useCallback((opts = {}) => {
        setOptions(opts)
        setAberto(true)
        return new Promise((resolve) => {
            resolver.current = resolve
        })
    }, [])

    const fecha = (resposta) => {
        resolver.current?.(resposta)
        resolver.current = null
        setAberto(false)
    }

    const confirmDialog = (
        <Dialog open={aberto} onOpenChange={(abrindo) => !abrindo && fecha(false)}>
            <DialogContent className="max-w-md">

                <DialogHeader>
                    <DialogTitle>{options?.title || 'Tem certeza?'}</DialogTitle>
                </DialogHeader>

                <DialogBody>
                    <DialogDescription className="text-2sm text-gray-700 whitespace-pre-line">
                        {options?.description || 'Essa ação não pode ser desfeita.'}
                    </DialogDescription>
                </DialogBody>

                <DialogFooter className="flex justify-end gap-2.5">
                    {!options?.hideCancel && (
                        <button type="button" className="btn btn-light" onClick={() => fecha(false)}>
                            {options?.cancelText || 'Cancelar'}
                        </button>
                    )}
                    <button type="button" className={'btn ' + (options?.confirmClass || 'btn-danger')} onClick={() => fecha(true)}>
                        {options?.confirmText || 'Excluir'}
                    </button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )

    return [confirm, confirmDialog]

}

export { useConfirm }
