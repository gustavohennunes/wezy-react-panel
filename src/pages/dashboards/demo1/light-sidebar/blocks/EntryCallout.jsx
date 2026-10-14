import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { toAbsoluteUrl } from '@/utils/Assets'
const EntryCallout = ({ className, nameMessage }) => {
    return (
        <Fragment>
            <style>
                {`
                    .entry-callout-bg {
                        background-image: url('${toAbsoluteUrl('/media/images/2600x1600/66.png')}');
                        background-size: 580px;
                        background-position: 110% bottom;
                    }
                    .dark .entry-callout-bg {
                        background-image: url('${toAbsoluteUrl('/media/images/2600x1600/66.png')}');
                    }
                    @media (max-width: 1250px) {
                        .entry-callout-bg {
                            background:none !important;
                        }
                    }
                    `}
            </style>

            <div className={`card h-full ${className}`}>

                <div className="card-body px-10 py-16 bg-[length:80%] rtl:[background-position:-70%_25%] [background-position:175%_25%] bg-no-repeat entry-callout-bg">

                    <div className="flex flex-col justify-center gap-4">

                        <h2 className="text-1.5xl font-semibold text-gray-900">
                            {nameMessage && (
                                <>
                                Olá, <b><span className="text-danger">{nameMessage}</span></b>!<br />
                                </>
                            )}
                            Seja bem-vindo(a) <br />ao seu sistema!
                        </h2>

                        <p className="text-sm font-normal text-gray-700 leading-5.5">
                            
                        </p>

                    </div>

                </div>

            </div>

        </Fragment>
    )
}

export { EntryCallout }
