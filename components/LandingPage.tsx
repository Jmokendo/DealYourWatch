"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  Timer,
  Verified,
} from "lucide-react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

// Elegant Apple-like landing for the beta of a luxury watches marketplace.
// TailwindCSS + shadcn/ui + Framer Motion. Spanish copy for AR/Argentina context.

const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  animate: { transition: { staggerChildren: 0.08 } },
};

function Nav() {
  const { data: session, status } = useSession();
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-400" />
          <span className="text-xl font-semibold tracking-tight">Watchs</span>
          <Badge variant="secondary" className="ml-2">
            Beta
          </Badge>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-zinc-700 md:flex">
          <a href="#como-funciona" className="transition hover:text-black">
            Cómo funciona
          </a>
          <a href="#seguridad" className="transition hover:text-black">
            Seguridad
          </a>
          <a href="#destacados" className="transition hover:text-black">
            Destacados
          </a>
          <a href="#tarifas" className="transition hover:text-black">
            Tarifas
          </a>
          <a href="#faq" className="transition hover:text-black">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <span className="hidden text-sm text-zinc-500 sm:inline">…</span>
          ) : session?.user ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm text-zinc-600 sm:inline">
                {session.user.name ?? session.user.email}
              </span>
              <Button
                type="button"
                variant="ghost"
                className="hidden sm:inline-flex"
                onClick={() => void signOut({ callbackUrl: "/" })}
              >
                Salir
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={() => void signIn("google", { callbackUrl: "/sell" })}
            >
              Iniciar sesión
            </Button>
          )}
          <Button
            type="button"
            className="rounded-2xl"
            asChild
          >
            <Link href="/sell">Publicar</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-white" />
      <div className="absolute inset-x-0 top-16 -z-10 h-[560px] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(24,24,27,0.12),transparent)]" />

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="grid items-center gap-10 lg:grid-cols-12"
        >
          <motion.div variants={fadeUp} className="lg:col-span-6">
            <Badge className="mb-4 rounded-xl bg-black text-white">
              Mercado de lujo verificado
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Compra y vende relojes
              <span className="block bg-gradient-to-br from-black via-zinc-800 to-zinc-500 bg-clip-text text-transparent">
                auténticos
              </span>
              con confianza.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-zinc-600">
              La forma más elegante de mover piezas de alta gama en Argentina.
              Certificación presencial, pago con liberación segura y experiencia
              digna de boutique.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                className="group rounded-2xl"
                asChild
              >
                <Link href="/listings">
                  Explorar relojes
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="rounded-2xl"
                asChild
              >
                <Link href="/sell">Quiero vender</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Verificación de autenticidad
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Pago con liberación 48h
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" /> Soporte beta prioritario
              </div>
            </div>
          </motion.div>
          <motion.div variants={fadeUp} className="lg:col-span-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 to-zinc-200 shadow-2xl ring-1 ring-black/5">
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <Sparkles className="mx-auto h-10 w-10 text-zinc-600" />
                  <p className="mt-4 font-medium text-zinc-700">
                    Tu pieza, en estudio
                  </p>
                  <p className="text-sm text-zinc-500">
                    (Placeholder de imagen / 3D / AR)
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="mt-16 grid grid-cols-2 gap-6 opacity-70 sm:grid-cols-3 lg:grid-cols-6">
          {[
            "Mercado Pago",
            "FedEx",
            "DHL",
            "Andreani",
            "Visa",
            "Mastercard",
          ].map((name) => (
            <div
              key={name}
              className="grid h-12 place-items-center rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-600 sm:text-sm"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const howSteps: { icon: IconComponent; title: string; desc: string }[] = [
  {
    icon: Camera,
    title: "Publicá tu pieza",
    desc: "Iniciá sesión con Google, subí fotos claras y detalles. Podemos ayudarte con el set de fotos pro.",
  },
  {
    icon: Verified,
    title: "Certificación",
    desc: "Coordinamos verificación con socios certificadores antes de la entrega.",
  },
  {
    icon: CreditCard,
    title: "Pago seguro",
    desc: "El comprador paga y retenemos el fondo hasta confirmar la entrega (liberación ≤48h).",
  },
  {
    icon: MapPin,
    title: "Entrega cuidada",
    desc: "Punto de entrega seguro o logística especializada. Todo documentado.",
  },
];

function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Cómo funciona
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-3 max-w-2xl text-zinc-600"
          >
            Proceso diseñado para proteger a comprador y vendedor, sin fricción.
          </motion.p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howSteps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="rounded-2xl border-zinc-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-zinc-600">{step.desc}</CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Security() {
  return (
    <section
      id="seguridad"
      className="bg-gradient-to-b from-white to-zinc-50 py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-6">
          <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Seguridad primero.
          </h3>
          <p className="mt-4 max-w-xl text-zinc-600">
            Combinamos certificación humana con trazabilidad digital para
            minimizar riesgos de piezas no auténticas o de origen dudoso.
          </p>
          <ul className="mt-6 space-y-3 text-zinc-700">
            {[
              "Socios certificadores con trayectoria en relojería de lujo",
              "Contrato de custodia y liberación del pago tras verificación",
              "Documentación de cadena de posesión (chain of custody)",
              "Soporte dedicado durante la operación (beta)",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-6">
          <Card className="rounded-3xl border-zinc-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Política de liberación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-zinc-600">
              <p>
                El pago se libera hasta en 48 horas hábiles luego de confirmar
                autenticidad y buen estado en la entrega.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="text-sm font-medium text-zinc-700">
                    Comprador
                  </div>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-600">
                    <li>Protección si la pieza no coincide</li>
                    <li>Reembolso si falla la verificación</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="text-sm font-medium text-zinc-700">
                    Vendedor
                  </div>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-600">
                    <li>Oferta firme antes de trasladar la pieza</li>
                    <li>Liquidación rápida post-entrega</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Featured() {
  return (
    <section id="destacados" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Piezas destacadas
            </h3>
            <p className="mt-3 text-zinc-600">
              Selección curada. Reemplazá estos placeholders con tu feed real.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="group"
            asChild
          >
            <Link href="/listings">
              Ver todo{" "}
              <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card
              key={i}
              className="group overflow-hidden rounded-2xl border-zinc-200"
            >
              <div className="grid aspect-square place-items-center bg-gradient-to-br from-zinc-100 to-zinc-200">
                <Layers className="h-7 w-7 text-zinc-600" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Rolex Submariner (Placeholder)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-600">
                <div className="flex items-center justify-between">
                  <span>2020 • Full set</span>
                  <span className="font-medium text-zinc-900">USD 13.9k</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const feeTiers: {
  title: string;
  price: string;
  items: string[];
}[] = [
  {
    title: "Intermediación",
    price: "8%–16%",
    items: [
      "Escrow y liberación 48h",
      "Verificación y documentación",
      "Soporte durante la operación",
    ],
  },
  {
    title: "Procesamiento",
    price: "3%–6%",
    items: [
      "Pasarela de pago local",
      "Anti-fraude básico",
      "Costos financieros incluidos",
    ],
  },
  {
    title: "Logística",
    price: "Variable",
    items: [
      "Punto de entrega seguro",
      "Seguro opcional",
      "Envío especializado",
    ],
  },
];

function Fees() {
  return (
    <section
      id="tarifas"
      className="bg-gradient-to-b from-zinc-50 to-white py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Tarifas beta transparentes
        </h3>
        <p className="mt-3 max-w-2xl text-zinc-600">
          Durante la beta mantenemos una estructura simple y todo incluido. La
          tarifa puede variar según el método de pago y logística.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {feeTiers.map((t) => (
            <Card key={t.title} className="rounded-2xl border-zinc-200">
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between">
                  <span>{t.title}</span>
                  <span className="text-2xl font-semibold">{t.price}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2 text-sm text-zinc-600">
                  {t.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-sm text-zinc-500">
          * Los porcentajes son de referencia para la beta y pueden ajustarse
          por riesgo/valor.
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const router = useRouter();
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Listo para empezar
        </h3>
        <p className="mt-3 text-zinc-600">
          Unite a los primeros vendedores y compradores verificados en Watchs.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            size="lg"
            className="rounded-2xl"
            asChild
          >
            <Link href="/login">Iniciar sesión con Google</Link>
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="rounded-2xl"
            onClick={() => router.push("/contact")}
          >
            Hablar con un asesor
          </Button>
        </div>
        <p className="mt-3 text-sm text-zinc-600">
          Continuá con Google para usar la plataforma
        </p>
        <div className="mx-auto mt-8 max-w-md">
          <div className="flex gap-2">
            <Input placeholder="Tu email" className="rounded-2xl" />
            <Button
              type="button"
              className="rounded-2xl"
              onClick={() => router.push("/login")}
            >
              Quiero invitación
            </Button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Te avisamos en cuanto haya cupos disponibles.
          </p>
        </div>
      </div>
    </section>
  );
}

const faqItems: { q: string; a: string }[] = [
  {
    q: "¿Cómo aseguramos la autenticidad?",
    a: "Trabajamos con socios certificadores. Ninguna pieza cambia de manos sin pasar por revisión y documentación.",
  },
  {
    q: "¿Cuándo se libera el pago?",
    a: "Hasta 48 horas hábiles después de confirmar verificación y entrega conforme.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Durante la beta, medios locales a través de pasarela con retención temporal (escrow).",
  },
  {
    q: "¿Puedo usar envío?",
    a: "Sí, con logística especializada y seguro opcional según el valor de la pieza.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="border-t border-zinc-200 py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Preguntas frecuentes
        </h3>
        <div className="mt-8 grid gap-8 text-zinc-700 md:grid-cols-2">
          {faqItems.map((f) => (
            <div key={f.q}>
              <div className="font-medium">{f.q}</div>
              <p className="mt-2 text-zinc-600">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-400" />
          <span className="text-sm text-zinc-600">
            © {new Date().getFullYear()} Watchs — Beta
          </span>
        </div>
        <div className="flex gap-6 text-sm text-zinc-600">
          <Link className="hover:text-black" href="/terms">
            Términos
          </Link>
          <Link className="hover:text-black" href="/privacy">
            Privacidad
          </Link>
          <Link className="hover:text-black" href="/contact">
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
}

function Announcement() {
  const router = useRouter();
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="rounded-2xl border-zinc-200 shadow-xl">
        <CardContent className="flex items-center gap-3 p-4">
          <Sparkles className="h-5 w-5 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium">Solicitá tu invitación</div>
            <div className="text-xs text-zinc-600">Cupos limitados para la beta.</div>
          </div>
          <Button
            type="button"
            size="sm"
            className="ml-auto shrink-0 rounded-xl"
            onClick={() => router.push("/login")}
          >
            Unirme
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <Nav />
      <Hero />
      <HowItWorks />
      <Security />
      <Featured />
      <Fees />
      <CTA />
      <FAQ />
      <Footer />
      <Announcement />
    </main>
  );
}
