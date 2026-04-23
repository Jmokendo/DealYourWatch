import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Creá tu cuenta",
    description: "Registrate gratis. Sin cuota mensual ni compromiso inicial.",
  },
  {
    number: "02",
    title: "Explorá o publicá",
    description: "Buscá entre cientos de relojes verificados o publicá el tuyo en minutos.",
  },
  {
    number: "03",
    title: "Negociá en tiempo real",
    description: "Hacé ofertas directamente al vendedor. El chat de negociación queda registrado.",
  },
  {
    number: "04",
    title: "Cerrá con seguridad",
    description: "El pago queda en escrow hasta que confirmás la autenticidad del reloj.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white px-5 py-[4.5rem] sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1280px]">
        <h2 className="text-[34px] font-semibold tracking-[-0.055em] text-[#151515] sm:text-[48px]">
          Cómo funciona
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ number, title, description }) => (
            <div key={number} className="flex flex-col gap-4">
              <span className="select-none text-[82px] font-semibold leading-none tracking-[-0.08em] text-[#f1efea]">
                {number}
              </span>
              <div>
                <h3 className="mb-2 text-lg font-semibold tracking-[-0.03em] text-[#171717]">
                  {title}
                </h3>
                <p className="text-sm leading-6 text-[#7e7a73]">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-full bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-[#2b2b2b]"
          >
            Empezar ahora &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
