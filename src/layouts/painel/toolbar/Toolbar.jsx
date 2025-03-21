
    import { Container } from '@/components'

    const Toolbar = ({ children }) => {
        return (
            <div className="pb-5">
                <Container
                    width="fluid"
                    className="flex items-start flex-wrap flex-col"
                >
                    {children}
                </Container>
            </div>
        )
    }
    export { Toolbar }
