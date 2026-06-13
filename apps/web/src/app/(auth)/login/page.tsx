import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center p-8">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Acceso para dueños de plataforma y equipos de campaña.
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
