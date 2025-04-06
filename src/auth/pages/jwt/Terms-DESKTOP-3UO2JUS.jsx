import { Link } from 'react-router-dom'
import { KeenIcon } from '@/components'

const Terms = () => {
    return (
        <div className="card max-w-[440px] w-full">
            
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
                <div className="text-2sm text-start text-gray-700">

                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    <br/><br/>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    <br/><br/>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    

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
