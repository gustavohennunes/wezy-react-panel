import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../auth/providers/JWTProvider";
import axios from "axios";
const initialProps = {
  configs: new Map(),
  fetchMenu: () => {},
  setMenuConfig: () => {},
  getMenuConfig: () => null,
  setCurrentMenuItem: () => {},
  getCurrentMenuItem: () => null,
};
const MenuContext = createContext(initialProps);
const useMenus = () => useContext(MenuContext);

const MenusProvider = ({ children }) => {
  const { auth, logout } = useAuth();
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [configs, setConfigs] = useState(new Map());

  const setMenuConfig = (name, config) => {
    setConfigs((prevConfigs) => {
      const newConfigs = new Map(prevConfigs);
      newConfigs.set(name, config);
      return newConfigs;
    });
  };

  const getCurrentMenuItem = () => {
    return currentMenuItem;
  };

  const getMenuConfig = (name) => {
    return configs.get(name) ?? null;
  };

  const fetchMenu = async () => {
    try {
      await axios
        .get("https://painel.amazon.cayman.com.br/api/v1/panel/menus", {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Customer-Host": "douglasfeuse",
          },
        })
        .then((response) => {
          const data = response.data.success.response.data;
          setMenuConfig("primary", data);
          return data;
        })
        .catch((error) => {
          //logout();
          console.log(error);
        });
    } catch (error) {
      //logout();
      console.error("Erro ao buscar menu:", error);
    }
  };

  useEffect(() => {
    if (auth) {
      fetchMenu();
    }
  }, [auth]);

  return (
    <MenuContext.Provider
      value={{
        configs,
        fetchMenu,
        setMenuConfig,
        getMenuConfig,
        setCurrentMenuItem,
        getCurrentMenuItem,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { MenusProvider, useMenus };
