import { useEffect, useState } from "react";
import { api } from "@/services/api";

const usePageData = (params) => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/module${params}`)
      .then((response) => {
        setData(response.data.items || []);
        setColumns(response.data.columns || []);
        setActions(response.data.actions || []);
      })
      .catch((err) => {
        console.error("Erro ao buscar dados:", err);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params]);

  return { data, columns, actions, loading, error };
};

export default usePageData;
