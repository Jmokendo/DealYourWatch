import Link from "next/link";
import { redirect } from "next/navigation";
import { SellForm } from "./components/SellForm";
import { getUserIdFromCookie } from "@/lib/getUser";

export default async function SellPage() {
  const userId = await getUserIdFromCookie();

  // Redirect unauthenticated users to login with intent preservation
  if (!userId) {
    const loginUrl = `/login?${new URLSearchParams({
      redirectTo: "/sell",
    }).toString()}`;
    redirect(loginUrl);
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.6fr] lg:items-start">
        <section>
          <div className="rounded-[12px] bg-white p-8 shadow-lg ring-1 ring-zinc-200 sm:p-10">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-500">
                Marketplace
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                Publicá tu reloj
              </h1>
              <p className="max-w-xl text-sm leading-7 text-zinc-600">
                Completá el formulario y tu reloj quedará en revisión. Te avisaremos cuando esté aprobado.
              </p>
            </div>
            <div className="mt-10">
              <SellForm />
            </div>
          </div>
        </section>

        <aside className="relative overflow-hidden rounded-[12px] bg-zinc-950 px-8 py-10 text-white shadow-lg lg:sticky lg:top-8 lg:px-10 lg:py-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-[-10%] top-8 text-[5rem] font-black uppercase tracking-[0.4em] text-white/10">
              Rolex
            </div>
            <div className="absolute right-4 top-[calc(100%-8rem)] text-[4rem] font-black uppercase tracking-[0.4em] text-white/10">
              AP
            </div>
          </div>

          <div className="relative space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">
                ¿Cómo funciona?
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Vendé con confianza
              </h2>
            </div>

            <ul className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Publicás tu reloj",
                  desc: "Completás el formulario con fotos y precio.",
                },
                {
                  step: "2",
                  title: "Lo revisamos",
                  desc: "El equipo verifica la publicación antes de aprobarla.",
                },
                {
                  step: "3",
                  title: "Recibís ofertas",
                  desc: "Los compradores negocian directo con vos.",
                },
                {
                  step: "4",
                  title: "Cobrás seguro",
                  desc: "Pago con escrow: el dinero se libera tras la entrega.",
                },
              ].map(({ step, title, desc }) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                    {step}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
                      {desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-[12px] bg-white/5 p-5 ring-1 ring-white/10">
              <p className="text-sm font-medium text-white">
                Comisión de intermediación
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Solo pagás si vendés. La comisión va del 8% al 16% según el precio final.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
