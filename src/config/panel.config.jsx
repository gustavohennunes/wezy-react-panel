export const MENU_SIDEBAR = [
  {
    title: "Home",
    icon: "element-11",
    path: "/",
    children: [
      {
        title: "Dark Sidebar",
        path: "/dark-sidebar",
      },
    ],
  },
  {
    title: "My Account",
    icon: "setting-2",
    children: [
      {
        title: "Account",
        children: [
          {
            title: "Get Started",
            path: "/account/home/get-started",
          },
          {
            title: "User Profile",
            path: "/account/home/user-profile",
          },
          {
            title: "Company Profile",
            path: "/account/home/company-profile",
          },
          {
            title: "Settings - With Sidebar",
            path: "/account/home/settings-sidebar",
          },
          {
            title: "Settings - Enterprise",
            path: "/account/home/settings-enterprise",
          },
          {
            title: "Settings - Plain",
            path: "/account/home/settings-plain",
          },
          {
            title: "Settings - Modal",
            path: "/account/home/settings-modal",
          },
        ],
      },
    ],
  },
];
