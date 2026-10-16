    import { useState } from 'react'
    import axios from 'axios'
    import { toast } from 'sonner'
    import { KeenIcon } from '@/components/keenicons'
    import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
    import { useMenus } from '@/providers/MenusProvider'
    import { useAuth } from '@/auth/providers/JWTProvider'
    import { getCustomerHost } from '@/utils/customerHost'

    // PRIMEIRO ACESSO SEM E-MAIL: O panel/menus MANDA email_pendente E O PAINEL FICA TRAVADO NESTE MODAL (SEM FECHAR NO
    // X, NO Esc OU CLICANDO FORA) ATÉ O USUÁRIO INFORMAR UM E-MAIL (panel/user-email). A API SÓ GRAVA PARA O USUÁRIO DO
    // TOKEN E SÓ SE ELE AINDA NÃO TIVER E-MAIL. "Sair" CONTINUA DISPONÍVEL

    const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const travar = (event) => event.preventDefault()

    const EmailObrigatorio = () => {

        const { getMenuConfig, fetchMenu } = useMenus()
        const { logout } = useAuth()

        const [email, setEmail]       = useState('')
        const [erro, setErro]         = useState('')
        const [enviando, setEnviando] = useState(false)

        if (getMenuConfig('primary')?.email_pendente !== true) return null

        const salvar = async (event) => {

            event.preventDefault()

            const valor = email.trim()
            if (!EMAIL_VALIDO.test(valor)) {
                setErro('Informe um e-mail válido.')
                return
            }

            setErro('')
            setEnviando(true)

            try {
                await axios.post(`${import.meta.env.VITE_CAYMAN_API_URL}/panel/user-email`, { email: valor }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Customer-Host': getCustomerHost(),
                    },
                })
                toast.success('E-mail cadastrado com sucesso.')
                //O MENU VOLTA COM email_pendente = false E O MODAL SAI
                await fetchMenu()
            } catch (error) {
                setErro(error?.response?.data?.error?.message || 'Não foi possível salvar o e-mail. Tente novamente.')
            } finally {
                setEnviando(false)
            }

        }

        return (
            <Dialog open onOpenChange={() => {}}>
                <DialogContent
                    className="max-w-[420px] p-0 [&>button]:hidden"
                    onEscapeKeyDown={travar}
                    onPointerDownOutside={travar}
                    onInteractOutside={travar}
                >
                    <DialogHeader className="flex-col items-start gap-1">
                        <DialogTitle className="flex items-center gap-2">
                            <KeenIcon icon="sms" className="text-xl text-primary" />
                            Cadastre seu e-mail
                        </DialogTitle>
                        <DialogDescription className="text-2sm text-gray-700">
                            Seu usuário ainda não tem e-mail. Informe um para continuar usando o painel — ele será usado para
                            recuperar a senha e receber avisos.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogBody>
                        <form onSubmit={salvar} noValidate className="flex flex-col gap-5">

                            <div className="flex flex-col gap-1">
                                <label htmlFor="email-obrigatorio" className="form-label text-gray-900 gap-[2px]">
                                    E-mail <span className="text-danger">*</span>
                                </label>
                                <label className="input">
                                    <input
                                        id="email-obrigatorio"
                                        type="email"
                                        autoComplete="email"
                                        autoFocus
                                        placeholder="seu@email.com.br"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="form-control"
                                        aria-invalid={Boolean(erro)}
                                        aria-describedby={erro ? 'email-obrigatorio-erro' : undefined}
                                    />
                                </label>
                                {erro && (
                                    <span id="email-obrigatorio-erro" role="alert" className="text-danger text-xs mt-1">
                                        {erro}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <button type="submit" className="btn btn-primary flex justify-center grow" disabled={enviando}>
                                    {enviando ? 'Salvando…' : 'Salvar e continuar'}
                                </button>
                                <button type="button" className="btn btn-sm btn-light flex justify-center" onClick={logout} disabled={enviando}>
                                    Sair
                                </button>
                            </div>

                        </form>
                    </DialogBody>
                </DialogContent>
            </Dialog>
        )

    }

    export { EmailObrigatorio }
