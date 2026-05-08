import { useMemo, useState } from 'react'

function App() {
  const initialProjects = [
    { id: 1, name: 'Fintech Mobile Redesign', status: 'Live', stack: 'React / Tailwind', stars: 92 },
    { id: 2, name: 'Creator Analytics Portal', status: 'In Progress', stack: 'React / Firebase', stars: 75 },
    { id: 3, name: 'E-commerce CRO Sprint', status: 'Planned', stack: 'React / Node', stars: 68 },
  ]
  const [projects, setProjects] = useState(initialProjects)
  const [form, setForm] = useState({ name: '', stack: '', status: 'Planned' })

  const stats = useMemo(() => {
    const liveCount = projects.filter((project) => project.status === 'Live').length
    const inProgressCount = projects.filter((project) => project.status === 'In Progress').length
    const avgScore = Math.round(
      projects.reduce((acc, project) => acc + project.stars, 0) / projects.length,
    )

    return { liveCount, inProgressCount, avgScore }
  }, [projects])

  const handleFormSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.stack.trim()) return

    const nextProject = {
      id: Date.now(),
      name: form.name.trim(),
      stack: form.stack.trim(),
      status: form.status,
      stars: 70,
    }

    setProjects((prev) => [nextProject, ...prev])
    setForm({ name: '', stack: '', status: 'Planned' })
  }

  const statusColor = {
    Live: 'bg-emerald-100 text-emerald-700',
    'In Progress': 'bg-amber-100 text-amber-700',
    Planned: 'bg-slate-200 text-slate-700',
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto max-w-6xl px-6 pb-10 pt-12">
        <p className="inline-flex rounded-full border border-violet-400/40 bg-violet-400/10 px-3 py-1 text-xs font-medium tracking-wide text-violet-200">
          Frontend-heavy full-stack showcase app
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          ClientFlow Studio
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          A production-style product dashboard showcasing project tracking, lightweight data workflows,
          and UI depth. Built with React + Tailwind and deployable on GitHub Pages.
        </p>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 pb-16 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Project Pipeline</h2>
            <span className="text-sm text-slate-400">{projects.length} total projects</span>
          </div>

          <div className="space-y-4">
            {projects.map((project) => (
              <article
                key={project.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-violet-500/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-medium text-white">{project.name}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[project.status]}`}
                  >
                    {project.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span>{project.stack}</span>
                  <span className="text-slate-600">|</span>
                  <span>Health score: {project.stars}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Team Snapshot</h2>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-950/70 p-3">
                <p className="text-2xl font-semibold text-white">{stats.liveCount}</p>
                <p className="text-xs text-slate-400">Live</p>
              </div>
              <div className="rounded-lg bg-slate-950/70 p-3">
                <p className="text-2xl font-semibold text-white">{stats.inProgressCount}</p>
                <p className="text-xs text-slate-400">Active</p>
              </div>
              <div className="rounded-lg bg-slate-950/70 p-3">
                <p className="text-2xl font-semibold text-white">{stats.avgScore}</p>
                <p className="text-xs text-slate-400">Avg score</p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-lg font-semibold text-white">Add New Case</h2>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring"
                placeholder="Project name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring"
                placeholder="Tech stack"
                value={form.stack}
                onChange={(event) => setForm((prev) => ({ ...prev, stack: event.target.value }))}
              />
              <select
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option>Planned</option>
                <option>In Progress</option>
                <option>Live</option>
              </select>
            </div>
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-violet-500 px-4 py-2 font-medium text-white transition hover:bg-violet-400"
            >
              Save Case Study
            </button>
          </form>
        </section>
      </main>

      <section className="border-t border-slate-800 bg-slate-900/70">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-white">Client feedback</h2>
            <p className="mt-3 text-slate-300">
              "This dashboard helped us communicate delivery quality and project momentum clearly to
              stakeholders every week."
            </p>
            <p className="mt-3 text-sm text-slate-500">- Product Director, Nova Labs</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Launch-ready workflow</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>React UI with reusable components</li>
              <li>Tailwind design system and responsive layouts</li>
              <li>Simple deploy script for GitHub Pages</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
