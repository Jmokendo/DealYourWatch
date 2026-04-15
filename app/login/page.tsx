"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email o contraseña inválidos");
      return;
    }

    router.push("/listings");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
        <h1 className="text-xl font-bold">Iniciar sesión</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2"
        />

        {error ? <p className="text-red-500 text-sm">{error}</p> : null}

        <button className="bg-black text-white p-2">Entrar</button>

        <p className="text-sm">
          ¿No tenés cuenta?{" "}
          <a href="/register" className="underline">
            Registrate
          </a>
        </p>
      </form>
    </div>
  );
}
