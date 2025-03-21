import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { toAbsoluteUrl } from '@/utils/Assets'
import { CommonAvatars } from '@/partials/common'
const EntryCallout = ({ className }) => {
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
                            background:none;
                        }
                    }
                    `}
            </style>

            <div className={`card h-full ${className}`}>
                <div className="card-body p-10 bg-[length:80%] rtl:[background-position:-70%_25%] [background-position:175%_25%] bg-no-repeat entry-callout-bg">
                    <div className="flex flex-col justify-center gap-4">
                        <CommonAvatars
                            size="size-10"
                            group={[
                                {
                                    filename: '300-4.png',
                                },
                                {
                                    filename: '300-1.png',
                                },
                                {
                                    filename: '300-2.png',
                                },
                                {
                                    fallback: 'S',
                                    variant:
                                        'text-success-inverse text-xs ring-success-light bg-success',
                                },
                            ]}
                        />

                        <h2 className="text-1.5xl font-semibold text-gray-900">
                            Seja bem-vindo(a) <br />à sua{' '}
                            <span className="text-danger">revenda Vymber!</span>
                        </h2>

                        <p className="text-sm font-normal text-gray-700 leading-5.5">
                            A Vymber é a plataforma número 1 em
                            <br />
                            rádio indoor para ambientes, e agora é sua <br />
                            vez de faturar alto com nossa revenda!
                        </p>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export { EntryCallout }
