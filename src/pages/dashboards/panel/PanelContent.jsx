
import { useLocation } from "react-router-dom";
//import usePageData from "@/hooks/usePageData";
import { usePageData } from "@/context/PageDataContext";
import { Models } from "@/components/list/models";

const PanelContent = () => {
  let location = useLocation();
  const { pageData } = usePageData();
  /* const { data, columns, actions, loading, error } = usePageData(location.search);

  if (loading) return <ScreenLoader />;
  if (error) return <p>Erro ao carregar dados</p>;
   */
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="grid gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-2">
          <Models></Models>
          {/* 
            if (data.layout == 'galeria'){
              <Models data={data} columns={columns} actions={actions}></Models>
            } else if (data.layout == 'form') {
              <Forms>    
            } else if (data.layout == 'link') {
              <Forms>    
            } else {        
              <Models data={data} columns={columns} actions={actions}></Models>
            }
          */}
        </div>
      </div>
    </div>
  );
};
export { PanelContent };
