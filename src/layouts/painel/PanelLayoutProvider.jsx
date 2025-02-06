import { createContext, useContext, useEffect, useState } from "react";
import { MENU_SIDEBAR } from "@/config/panel.config";
import { useMenus } from "@/providers";
import { useLayout } from "@/providers";
import { deepMerge } from "@/utils";
import { PanelLayoutConfig } from ".";

// Interface defining the properties of the layout provider context

// Initial layout provider properties, using Panel layout configuration as the default
const initalLayoutProps = {
  layout: PanelLayoutConfig,
  // Default layout configuration
  mobileSidebarOpen: false,
  // Mobile sidebar is closed by default
  setMobileSidebarOpen: (open) => {
    console.log(`${open}`);
  },
};

// Create a context to manage the layout-related state and logic for Panel layout
const PanelLayoutContext = createContext(initalLayoutProps);

// Custom hook to access the layout context in other components
const usePanelLayout = () => useContext(PanelLayoutContext);

// Provider component that sets up the layout state and context for Panel layout
const PanelLayoutProvider = ({ children }) => {
  const { getMenuConfig, fetchMenu } = useMenus(); // Hook to manage menu configurations
  const { getLayout, setCurrentLayout } = useLayout(); // Hook to get and set layout configuration

  // Merge the Panel layout configuration with the current layout configuration fetched via getLayout
  const layoutConfig = deepMerge(
    PanelLayoutConfig,
    getLayout(PanelLayoutConfig.name),
  );

  // Set the initial state for layout and mobile sidebar
  const [layout] = useState(layoutConfig); // Layout configuration is stored in state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Manage state for mobile sidebar

  // Set the menu configuration for the primary menu using the provided MENU_SIDEBAR configuration
  //setMenuConfig("primary", MENU_SIDEBAR);
  //fetchMenu();
  /* useEffect(() => {
    if (!getMenuConfig("primary")) {
      console.log("📢 Nenhum menu encontrado, buscando...");
      fetchMenu();
    }
  }, [getMenuConfig, fetchMenu]); */

  // When the layout state changes, set the current layout configuration in the layout provider
  useEffect(() => {
    setCurrentLayout(layout); // Update the current layout in the global layout state
  }, [layout, setCurrentLayout]); // Re-run this effect if layout or setCurrentLayout changes

  // Provide the layout state, sticky header state, and sidebar state to children components via context
  return (
    <PanelLayoutContext.Provider
      value={{
        layout,
        // The current layout configuration
        mobileSidebarOpen,
        // Whether the mobile sidebar is currently open
        setMobileSidebarOpen, // Function to toggle the mobile sidebar state
      }}
    >
      {children} {/* Render child components that consume this context */}
    </PanelLayoutContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { PanelLayoutProvider, usePanelLayout };
