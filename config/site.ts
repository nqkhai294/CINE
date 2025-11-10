export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "CINE",
  description: "Xem phim online miễn phí chất lượng cao",
  navItems: [
    {
      label: "Phim lẻ",
      href: "/films-single",
    },
    {
      label: "Phim bộ",
      href: "/films-series",
    },
    {
      label: "Thể loại",
      href: "/genres",
    },
    {
      label: "Quốc gia",
      href: "/films-by-country",
    },
    // {
    //   label: "Xem chung",
    //   href: "/watch-together",
    // },
    {
      label: "Diễn viên",
      href: "/actors",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
