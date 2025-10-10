export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div>
      <header className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex items-center gap-2 text-slate-200">
          <span className="text-xl">🛍️</span>
          <span className="font-semibold">Multi-Company Marketplace</span>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 pb-16 md:grid-cols-2">
        <section className="flex flex-col justify-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {title || "Compra y vende todo en un solo lugar"}
          </h1>
          <p className="mb-6 text-slate-300">
            {subtitle || "Gestiona múltiples tiendas, catálogos y pedidos con seguridad y rapidez."}
          </p>
          <ul className="space-y-2 text-slate-400">
            <li>• Pagos seguros</li>
            <li>• Verificación por email</li>
            <li>• Roles de usuario</li>
          </ul>
        </section>

        <section className="flex items-start justify-center">
          <div className="w-full max-w-md rounded-2xl bg-white/5 p-6 shadow-xl ring-1 ring-white/10 backdrop-blur">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
