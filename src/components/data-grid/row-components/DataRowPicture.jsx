import React, { useState } from 'react'
import { DefaultTooltip, KeenIcon } from '@/components'
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
                    >
                        <button
                            onClick={handleOpen}
                            className="min-w-5 min-h-5 p-0 border-none bg-transparent cursor-pointer"
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
                            <DialogBody className="m-auto">
                                <img
                                    className="min-w-16 min-h-16 m-auto"
                                    src={row.content.large_thumb}
                                    alt="Preview"
                                />
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
