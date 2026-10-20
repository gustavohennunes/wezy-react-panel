import { useState } from 'react'
import { DefaultTooltip, KeenIcon } from '@/components'
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from '@/components/ui/dialog'
const DataRowPicture = ({ row }) => {
    const [open, setOpen] = useState(false)

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div>
            {row.content.small_thumb ? (
                <>
                    <DefaultTooltip
                        title={
                            <img
                                className="min-w-5 min-h-5"
                                src={row.content.small_thumb}
                                alt="Preview"
                            />
                        }
                        placement={'right'}
                        className="min-w-5 min-h-5"
                        tooltipClassName="!bg-white !p-1.5 !shadow-[0_2px_10px_rgba(0,0,0,0.15)]"
                    >
                        <button
                            type="button"
                            onClick={handleOpen}
                            className="min-w-5 min-h-5 p-0 border-none bg-transparent cursor-pointer"
                            aria-label="Ver imagem"
                        >
                            <KeenIcon
                                icon="picture"
                                style="solid"
                                className="text-gray-500 text-md"
                            />
                        </button>
                    </DefaultTooltip>
                    <Dialog open={open} onOpenChange={handleClose}>
                        <DialogContent className="container-fixed max-w-[auto] w-auto p-0 [&>button]:hidden">
                            <DialogHeader className="hidden">
                                <DialogTitle></DialogTitle>
                                <DialogDescription></DialogDescription>
                            </DialogHeader>
                            <DialogBody className="relative m-auto">
                                <img
                                    className="min-w-16 min-h-16 m-auto"
                                    src={row.content.large_thumb}
                                    alt="Preview"
                                />
                                {/* O X PADRÃO DO DialogContent FICA ESCONDIDO ([&>button]:hidden) PORQUE SUMIA EM CIMA DA IMAGEM.
                                    ESTE FICA SOBRE O CANTO DA IMAGEM, COM FUNDO PRÓPRIO, VISÍVEL EM QUALQUER FOTO */}
                                <DialogClose
                                    className="absolute top-2 end-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus:outline-none"
                                    aria-label="Fechar"
                                >
                                    <KeenIcon icon="cross" className="text-base" />
                                </DialogClose>
                            </DialogBody>
                        </DialogContent>
                    </Dialog>
                </>
            ) : (
                <>
                    <KeenIcon
                        icon="picture"
                        style="filled"
                        className="text-gray-500 text-md disabled"
                    />
                </>
            )}
        </div>
    )
}
export { DataRowPicture }
