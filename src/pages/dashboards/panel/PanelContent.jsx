import { useLocation } from "react-router-dom";
//import usePageData from "@/hooks/usePageData";
import { usePageData } from "@/context/PageDataContext";
import { Models } from "@/components/list/models";

const PanelContent = () => {
  let content,btnAdd,search;
  let location = useLocation();
  const { pageData } = usePageData();
  /* const { data, columns, actions, loading, error } = usePageData(location.search);

  if (loading) return <ScreenLoader />;
  if (error) return <p>Erro ao carregar dados</p>;
   */

  //content = <Models></Models>;
  content = <Models model={pageData?.params?.list?.rows} columnHeader={pageData?.params?.list?.header} btnAdd={pageData?.params?.add_button} search={pageData?.params?.search}></Models>
  if (pageData?.layout == "galeria") {
    content = "<Forms>";
  } else if (pageData?.layout == "form") {
    content = "<Forms>";
  } else if (pageData?.layout == "link") {
    content = "<Forms>";
  }

  /* Botão adicionar */
    btnAdd = '<button className="btn btn-primary"></button>';

  /* Pesquisar */
    search = '';

  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="grid gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-2">{content}</div>
      </div>
    </div>
  );
};
export { PanelContent };
