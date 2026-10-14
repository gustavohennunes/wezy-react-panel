import { useCallback, useRef, useState } from 'react'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// CONFIRMAÇÃO EM PROMISE, NO LUGAR DO confirm() NATIVO QUE O PAINEL ANTIGO USAVA:
//   const [confirm, confirmDialog] = useConfirm()
//   if (!(await confirm({ title: 'Excluir?' }))) return
//   ...e renderizar {confirmDialog} no componente.
const useConfirm = () => {

    const [options, setOptions] = useState(null)
    const resolver = useRef(null)

    const confirm = useCallback((opts = {}) => {
        setOptions(opts)
        return new Promise((resolve) => {
            resolver.current = resolve
        })
    }, [])

    const fecha = (resposta) => {
        resolver.current?.(resposta)
        resolver.current = null
        setOptions(null)
    }

    const confirmDialog = (
        <Dialog open={options !== null} onOpenChange={(aberto) => !aberto && fecha(false)}>
            <DialogContent className="max-w-md">

                <DialogHeader>
                    <DialogTitle>{options?.title || 'Tem certeza?'}</DialogTitle>
                </DialogHeader>

                <DialogBody>
                    <DialogDescription className="text-2sm text-gray-700">
                        {options?.description || 'Essa ação não pode ser desfeita.'}
                    </DialogDescription>
                </DialogBody>

                <DialogFooter className="flex justify-end gap-2.5">
                    <button type="button" className="btn btn-light" onClick={() => fecha(false)}>
                        {options?.cancelText || 'Cancelar'}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => fecha(true)}>
                        {options?.confirmText || 'Excluir'}
                    </button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )

    return [confirm, confirmDialog]

}

export { useConfirm }
