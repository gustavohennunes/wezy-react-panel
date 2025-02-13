import {} from "@/components";
import {
  Menu,
  MenuToggle,
  KeenIcon,
  MenuIcon,
  MenuItem,
  MenuLink,
  MenuSeparator,
  MenuSub,
  MenuTitle,
} from "@/components";
import { useLanguage } from "@/i18n";
const DataRowActionsMenu = ({ row }) => {
  const { isRTL } = useLanguage();
  return (
    <Menu className="inline-flex">
      <MenuItem
        toggle="dropdown"
        trigger="click"
        dropdownProps={{
          placement: isRTL() ? "bottom-start" : "bottom-end",
          modifiers: [
            {
              name: "offset",
              options: {
                offset: isRTL() ? [0, -10] : [0, 10], // [skid, distance]
              },
            },
          ],
        }}
      >
        <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
          <KeenIcon icon="dots-vertical" />
        </MenuToggle>

        <MenuSub className="menu-default" rootClassName="w-full max-w-[175px]">
          {Array.isArray(row.content) && row.content.length > 0 ? (
            row.content.map((item, index) => (
              <MenuItem key={index} path={item.url || "#"} target={item.target || "_self"}>
                <MenuLink>
                  <MenuIcon>
                    <KeenIcon icon="search-list" />
                  </MenuIcon>
                  <MenuTitle>{item.title}</MenuTitle>
                </MenuLink>
              </MenuItem>
            ))
          ) : (
            <MenuItem>
              <MenuLink>
                <MenuTitle className="text-gray-500">No Actions</MenuTitle>
              </MenuLink>
            </MenuItem>
          )}
        </MenuSub>
      </MenuItem>
    </Menu>
  );
};
export { DataRowActionsMenu };
