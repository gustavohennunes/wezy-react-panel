import useBodyClasses from '@/hooks/useBodyClasses'
import { toAbsoluteUrl } from '@/utils'

/**
 * Tela cheia exibida quando não é possível identificar o sistema/cliente
 * (host não resolvido no front ou rejeitado pelo backend).
 *
 * Bloqueia todo o app — renderizada pelo SystemProvider no lugar dos filhos.
 */
const SystemNotFoundPage = () => {
    useBodyClasses('dark:bg-coal-500')

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full px-6 text-center">
            <div className="mb-10">
                <img
                    src={toAbsoluteUrl('/media/illustrations/19.svg')}
                    className="dark:hidden max-h-[160px]"
                    alt="Sistema não encontrado"
                />
                <img
                    src={toAbsoluteUrl('/media/illustrations/19-dark.svg')}
                    className="light:hidden max-h-[160px]"
                    alt="Sistema não encontrado"
                />
            </div>

            <span className="badge badge-danger badge-outline mb-3">
                Sistema não encontrado
            </span>

            <h3 className="text-2.5xl font-semibold text-gray-900 mb-2">
                Não foi possível identificar o sistema
            </h3>

            <div className="text-md text-gray-700 max-w-[420px]">
                O endereço acessado não corresponde a nenhum sistema
                disponível. Verifique a URL e tente novamente.
            </div>
        </div>
    )
}

export { SystemNotFoundPage }
