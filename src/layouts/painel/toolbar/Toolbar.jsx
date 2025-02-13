import { Container } from "@/components";
const Toolbar = ({ children }) => {
  return (
    <div className="pb-5">
      <Container
        width="fluid"
        className="flex items-center flex-wrap gap-3"
      >
        {children}
      </Container>
    </div>
  );
};
export { Toolbar };
