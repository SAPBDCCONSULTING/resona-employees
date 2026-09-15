export default function EmployeeHomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">Employees</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight text-ink">My sessions</h1>
        <p className="mt-2 text-ink-muted">
          Open assignments for 1:1 discussions and surveys will appear here.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-line bg-bg-elevated p-6">
        <p className="text-sm text-ink-muted">No open sessions yet.</p>
        <p className="mt-4 text-xs text-ink-muted">
          Language: English (i18n wiring in Phase 1)
        </p>
      </section>

      <footer className="mt-auto pt-10 text-center text-xs text-ink-muted">
        PulseFeedback · Listen · Learn · Act
      </footer>
    </div>
  );
}
