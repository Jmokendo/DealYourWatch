import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginFormPanelProps {
  email: string;
  password: string;
  error: string;
  busy: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function LoginFormPanel({
  email,
  password,
  error,
  busy,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormPanelProps) {
  return (
    <section className="flex min-h-full items-center justify-center bg-[#fdfcfa] px-6 py-12 sm:px-10 lg:px-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 lg:hidden">
          <p className="text-[22px] font-semibold tracking-[-0.04em] text-[#1c1c1f]">
            DealYourWatch
          </p>
          <p className="mt-2 text-sm text-[#7d7972]">
            El marketplace de relojes de lujo en LATAM.
          </p>
        </div>

        <div className="space-y-2">
          <h1 className="text-[38px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#19191c] sm:text-[46px]">
            Bienvenido de nuevo
          </h1>
          <p className="text-[15px] text-[#8a867e]">Ingresa a tu cuenta</p>
        </div>

        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[#5b5852]">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="jose@email.com"
              required
              autoComplete="email"
              className="h-12 rounded-[16px] border-[#e1ddd7] bg-white px-4 text-base shadow-none placeholder:text-[#b0aca5] focus-visible:ring-black/10"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[#5b5852]">
              Contrasena
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Contrasena"
              required
              autoComplete="current-password"
              className="h-12 rounded-[16px] border-[#e1ddd7] bg-white px-4 text-base shadow-none placeholder:text-[#b0aca5] focus-visible:ring-black/10"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="text-sm text-[#6f6b64]"
              title="Recuperacion de contrasena no disponible todavia"
            >
              Olvide mi contrasena
            </button>
          </div>

          {error ? (
            <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={busy}
            className="mt-2 h-13 w-full rounded-full bg-[#1d1d21] text-base font-semibold text-white transition hover:bg-[#2f2f34]"
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Ingresando
              </span>
            ) : (
              "Ingresar"
            )}
          </Button>

          <div className="relative py-1">
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#e6e2db]" />
            <p className="relative mx-auto w-fit bg-[#fdfcfa] px-3 text-xs text-[#aaa59d]">
              o continua con
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-full border-[#1d1d21] bg-transparent text-base font-medium text-[#202024] hover:bg-[#f6f5f2]"
          >
            Continuar con Google
          </Button>

          <div className="border-t border-[#e6e2db] pt-4 text-sm text-[#6f6b64]">
            No tenes cuenta?{" "}
            <Link href="/register" className="font-semibold text-[#1d1d21]">
              Registrate
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
