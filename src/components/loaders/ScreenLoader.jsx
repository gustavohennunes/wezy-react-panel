//POSIÇÕES E ATRASOS DAS 3 BOLINHAS (bouncing-circles DO svgbackgrounds.com)
const BOLINHAS = [
    { cx: 40, begin: '-.4' },
    { cx: 100, begin: '-.2' },
    { cx: 160, begin: '0' },
]

const ScreenLoader = () => {

    return (
        <div className="relative w-full h-full min-h-[350px]">
            <div className="flex flex-col items-center gap-2 justify-center absolute inset-0 z-50 transition-opacity duration-700 ease-in-out">
                {/* SVG INLINE (E NÃO <img> EM BASE64) PARA A COR SEGUIR O TEMA: #052850 NO CLARO, #fff NO ESCURO */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 200 200"
                    className="h-[60px] max-w-none text-[#052850] dark:text-white"
                    role="img"
                    aria-label="Carregando"
                >
                    {BOLINHAS.map(({ cx, begin }) => (
                        <circle key={cx} fill="currentColor" stroke="currentColor" strokeWidth="15" r="15" cx={cx} cy="65">
                            <animate
                                attributeName="cy"
                                calcMode="spline"
                                dur="1.1"
                                values="65;135;65;"
                                keySplines=".5 0 .5 1;.5 0 .5 1"
                                repeatCount="indefinite"
                                begin={begin}
                            />
                        </circle>
                    ))}
                </svg>
            </div>
        </div>
    )

}

export { ScreenLoader }
