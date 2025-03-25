import { toAbsoluteUrl } from '@/utils'

const ScreenLoader = () => {

    return (
        <div className="relative w-full h-full min-h-[350px]">
            <div className="flex flex-col items-center gap-2 justify-center absolute inset-0 z-50 transition-opacity duration-700 ease-in-out">
                <img
                    className="h-[60px] max-w-none"
                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBkYXRhLWluamVjdC11cmw9Imh0dHBzOi8vd3d3LnN2Z2JhY2tncm91bmRzLmNvbS9zdmcvcHJlbG9hZGVycy9ib3VuY2luZy1jaXJjbGVzLnN2ZyIgbG9hZGluZz0ibGF6eSI+DQogICAgPGNpcmNsZSBjbGFzcz0ic3ZnX19maWxsIHN2Z19fc3Ryb2tlIHN2Z19zdHJva2VXaWR0aCIgZmlsbD0iI2JlMTYyMiIgc3Ryb2tlPSIjYmUxNjIyIiBzdHJva2Utd2lkdGg9IjE1IiByPSIxNSIgY3g9IjQwIiBjeT0iNjUiPg0KICAgICAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJjeSIgY2FsY01vZGU9InNwbGluZSIgZHVyPSIxLjEiIHZhbHVlcz0iNjU7MTM1OzY1OyIga2V5U3BsaW5lcz0iLjUgMCAuNSAxOy41IDAgLjUgMSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGJlZ2luPSItLjQiPg0KICAgICAgICA8L2FuaW1hdGU+DQogICAgPC9jaXJjbGU+DQogICAgPGNpcmNsZSBjbGFzcz0ic3ZnX19maWxsIHN2Z19fc3Ryb2tlIHN2Z19zdHJva2VXaWR0aCIgZmlsbD0iI2JlMTYyMiIgc3Ryb2tlPSIjYmUxNjIyIiBzdHJva2Utd2lkdGg9IjE1IiByPSIxNSIgY3g9IjEwMCIgY3k9IjY1Ij4NCiAgICAgICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iY3kiIGNhbGNNb2RlPSJzcGxpbmUiIGR1cj0iMS4xIiB2YWx1ZXM9IjY1OzEzNTs2NTsiIGtleVNwbGluZXM9Ii41IDAgLjUgMTsuNSAwIC41IDEiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBiZWdpbj0iLS4yIj4NCiAgICAgICAgPC9hbmltYXRlPg0KICAgIDwvY2lyY2xlPg0KICAgIDxjaXJjbGUgY2xhc3M9InN2Z19fZmlsbCBzdmdfX3N0cm9rZSBzdmdfc3Ryb2tlV2lkdGgiIGZpbGw9IiNiZTE2MjIiIHN0cm9rZT0iI2JlMTYyMiIgc3Ryb2tlLXdpZHRoPSIxNSIgcj0iMTUiIGN4PSIxNjAiIGN5PSI2NSI+DQogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImN5IiBjYWxjTW9kZT0ic3BsaW5lIiBkdXI9IjEuMSIgdmFsdWVzPSI2NTsxMzU7NjU7IiBrZXlTcGxpbmVzPSIuNSAwIC41IDE7LjUgMCAuNSAxIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgYmVnaW49IjAiPg0KICAgICAgICA8L2FuaW1hdGU+DQogICAgPC9jaXJjbGU+DQo8L3N2Zz4="
                    alt="logo"
                />
            </div>
        </div>
    )

}

export { ScreenLoader }