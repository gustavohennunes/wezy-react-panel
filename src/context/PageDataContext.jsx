import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/services/api";

const PageDataContext = createContext();

export const PageDataProvider = ({ children }) => {
    let location = useLocation();
    const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/panel/module?module=administracao`)
      .then((response) => {
        //console.log(response)
        setPageData(response.data.success.response.data); // Armazena o JSON da API no contexto
      })
      .catch((err) => {
        console.error("Erro ao carregar dados da página:", err);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <PageDataContext.Provider value={{ pageData, loading, error }}>
      {children}
    </PageDataContext.Provider>
  );
};

export const usePageData = () => useContext(PageDataContext);
