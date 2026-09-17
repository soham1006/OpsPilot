"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/inbox", label: "Inbox" },
  { href: "/customers", label: "Customers" },
  { href: "/appointments", label: "Appointments" },
  { href: "/billing", label: "Billing" },
  { href: "/policies", label: "Policies" },
  { href: "/tasks", label: "Tasks" },
  { href: "/missions", label: "Missions" },
  { href: "/audit", label: "Audit" },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NorthstarNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="mx-auto flex max-w-7xl justify-center gap-1 overflow-x-auto px-5 pb-3 sm:px-6"
    >
      {navigation.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={[
              "group relative whitespace-nowrap rounded-md px-3 py-2",
              "text-[13px] font-medium transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
              active
                ? "bg-black/[0.065] text-black/90"
                : "text-black/55 hover:bg-black/[0.045] hover:text-black/80",
            ].join(" ")}
          >
            {item.label}

            <span
              className={[
                "absolute inset-x-3 -bottom-0.5 h-px origin-left bg-black/55 transition-transform",
                active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
              ].join(" ")}
            />
          </Link>
        );
      })}
    </nav>
  );
}