import { Link } from 'react-router-dom'
import { KeenIcon } from '@/components'
import { useAuth } from '@/auth/providers/JWTProvider'
import { useEffect } from 'react'

const Terms = () => {

    const { publicInfos } = useAuth()

    useEffect(() => {
        console.log('1', publicInfos);
    }, [publicInfos])

    return (
        <div className="card max-w-[600px] !w-full">
            
            <div className="card-body flex flex-col gap-6 p-10">
                
                <div className="flex gap-3 mb-2.5 items-center">
                    <img
                        src="https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/dfca77e57617844b2a0d41057e7b884a/logo-vymber.svg"
                        className="dark:hidden"
                        style={{ width: '135px' }}
                    />
                    <img
                        src="https://files.caymanweb.com.br/f7e00f1f7c8e403b99f72159635a3f34/dfca77e57617844b2a0d41057e7b884a/logo-vymber.svg"
                        className="hidden dark:block"
                        style={{
                            filter: 'brightness(100)',
                            width: '135px',
                        }}
                    />
                    <div className="text-2sm text-gray-600 leading-none flex items-center font-medium">
                        |
                    </div>
                    <div className="text-2sm text-gray-600 leading-none flex items-center font-medium">
                        Revenda
                    </div>
                </div>

                <h3 className="text-left font-semibold">
                    Termos de uso
                </h3>
                <div className="scrollable-y-auto max-h-[500px] text-2sm text-start text-gray-700">
                    {publicInfos?.termos ? (<span dangerouslySetInnerHTML={{ __html: publicInfos?.termos }} />) : 'Nenhum termo de uso encontrado.'}
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
