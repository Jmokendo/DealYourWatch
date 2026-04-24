import Link from "next/link";

const COLUMNS = [
  {
    heading: "Marketplace",
    links: [
      { label: "Explorar", href: "/listings" },
      { label: "Marcas", href: "/#brands" },
      { label: "Vender", href: "/sell" },
    ],
  },
  {
    heading: "Cuenta",
    links: [
      { label: "Iniciar sesión", href: "/login" },
      { label: "Crear cuenta", href: "/register" },
      { label: "Mi perfil", href: "/me" },
    ],
  },
  {
    heading: "Empresa",
    links: [
      { label: "Sobre DealYourWatch", href: "/contact" },
      { label: "Contacto", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Términos", href: "/terms" },
      { label: "Privacidad", href: "/privacy" },
    ],
  },
];

export default function HomeFooter() {
  return (
    <footer className="bg-[#111111] px-5 pb-8 pt-14 text-[#a5a19a] sm:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <p className="mb-2 text-[30px] font-semibold tracking-[-0.05em] text-white">
              WATCHS
            </p>
            <p className="max-w-[220px] text-xs leading-relaxed text-[#7e7a73]">
              El marketplace de relojes de lujo en LATAM.
            </p>
          </div>

          {COLUMNS.map(({ heading, links }) => (
            <div key={heading}>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6f6b65]">
                {heading}
              </p>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-[#a5a19a] transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.08] pt-6 text-xs text-[#6f6b65] sm:flex-row">
          <span>© {new Date().getFullYear()} Watchs · Argentina · México · Chile · Colombia</span>
          <span>200+ relojes verificados</span>
        </div>
      </div>
    </footer>
  );
}
