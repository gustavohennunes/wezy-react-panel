import { Link } from 'react-router-dom'
import { PANEL_LOGO } from '@/config/branding'
import { KeenIcon } from '@/components'

// OS TERMOS VINHAM DO CARD "public-webservice", QUE NÃO EXISTE NOS PAINÉIS
// (RETORNAVA 400 EM TODA REQUISIÇÃO). QUANDO O CARD FOR CRIADO, BASTA
// BUSCÁ-LO AQUI E TROCAR O TEXTO DE FALLBACK ABAIXO.
const Terms = () => {

    return (
        <div className="card max-w-[600px] !w-full">
            
            <div className="card-body flex flex-col gap-6 p-10">
                
                <div className="flex gap-3 mb-2.5 items-center">
                    <img
                        src={PANEL_LOGO}
                        className="dark:hidden"
                        style={{ width: '135px' }}
                    />
                    <img
                        src={PANEL_LOGO}
                        className="hidden dark:block"
                        style={{
                            filter: 'brightness(100)',
                            width: '135px',
                        }}
                    />
                </div>

                <h3 className="text-left font-semibold">
                    Termos de uso
                </h3>
                <div className="scrollable-y-auto max-h-[500px] text-2sm text-start text-gray-700">
                    Nenhum termo de uso encontrado.
                </div>

                <div className="flex items-start justify-start gap-1">
                    
                    <Link
                        to="/auth/signup"
                        className="text-xs font-medium link flex gap-2 items-center"
                    >
                        <KeenIcon icon="black-left" /> 
                        Voltar para cadastro
                    </Link>
                </div>
            </div>
        </div>
    )
}
export { Terms }
