import { useEffect, useMemo, useState } from 'react'

const STATUS_OPTIONS = ['Planning', 'Delivery', 'Review', 'Completed']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

const initialProjects = [
  {
    id: 1,
    name: 'Mobile Banking Experience',
    client: 'NorthStar Finance',
    owner: 'Dana',
    stack: 'React, Node.js, Postgres',
    status: 'Delivery',
    priority: 'High',
    progress: 64,
    budgetK: 120,
    dueDate: '2026-06-05',
    risk: 'At Risk',
    updatedAt: '2h ago',
  },
  {
    id: 2,
    name: 'Creator Insights Platform',
    client: 'Bloom Social',
    owner: 'Karim',
    stack: 'React, Firebase, BigQuery',
    status: 'Review',
    priority: 'Medium',
    progress: 82,
    budgetK: 95,
    dueDate: '2026-05-26',
    risk: 'On Track',
    updatedAt: '1d ago',
  },
  {
    id: 3,
    name: 'B2B Onboarding Revamp',
    client: 'Aster Systems',
    owner: 'Elena',
    stack: 'Next.js, Prisma, PostgreSQL',
    status: 'Planning',
    priority: 'High',
    progress: 24,
    budgetK: 76,
    dueDate: '2026-06-18',
    risk: 'At Risk',
    updatedAt: '4h ago',
  },
]

const defaultForm = {
  name: '',
  client: '',
  owner: '',
  stack: '',
  budgetK: '',
  dueDate: '',
  priority: 'Medium',
}

function cycleStatus(status) {
  const currentIndex = STATUS_OPTIONS.indexOf(status)
  const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length
  return STATUS_OPTIONS[nextIndex]
}

function normalizeProject(project, fallbackProject, index) {
  const budgetValue = Number(project?.budgetK)
  const progressValue = Number(project?.progress)

  return {
    ...fallbackProject,
    ...project,
    id: project?.id ?? Date.now() + index,
    budgetK: Number.isFinite(budgetValue) && budgetValue >= 0 ? budgetValue : fallbackProject.budgetK,
    progress: Number.isFinite(progressValue) && progressValue >= 0 ? progressValue : fallbackProject.progress,
  }
}

function App() {
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('clientflow-projects')
    if (!savedProjects) return initialProjects

    try {
      const parsedProjects = JSON.parse(savedProjects)
      if (!Array.isArray(parsedProjects) || parsedProjects.length === 0) return initialProjects

      return parsedProjects.map((project, index) =>
        normalizeProject(project, initialProjects[index % initialProjects.length], index),
      )
    } catch {
      return initialProjects
    }
  })
  const [form, setForm] = useState(defaultForm)
  const [formError, setFormError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [sortBy, setSortBy] = useState('dueDate')

  useEffect(() => {
    localStorage.setItem('clientflow-projects', JSON.stringify(projects))
  }, [projects])

  const analytics = useMemo(() => {
    const totalBudget = projects.reduce((acc, project) => acc + Number(project.budgetK || 0), 0)
    const avgProgress =
      projects.length === 0
        ? 0
        : Math.round(
            projects.reduce((acc, project) => acc + Number(project.progress || 0), 0) / projects.length,
          )
    const atRiskCount = projects.filter((project) => project.risk === 'At Risk').length
    const completedCount = projects.filter((project) => project.status === 'Completed').length

    return {
      totalBudget,
      avgProgress,
      atRiskCount,
      deliveryRate: projects.length === 0 ? 0 : Math.round((completedCount / projects.length) * 100),
    }
  }, [projects])

  const filteredProjects = useMemo(() => {
    return [...projects]
      .filter((project) => {
        const matchesQuery =
          query.trim().length === 0 ||
          `${project.name} ${project.client} ${project.owner}`.toLowerCase().includes(query.toLowerCase())
        const matchesStatus = statusFilter === 'All' || project.status === statusFilter
        const matchesPriority = priorityFilter === 'All' || project.priority === priorityFilter
        return matchesQuery && matchesStatus && matchesPriority
      })
      .sort((a, b) => {
        if (sortBy === 'budget') return b.budgetK - a.budgetK
        if (sortBy === 'progress') return b.progress - a.progress
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
  }, [priorityFilter, projects, query, sortBy, statusFilter])

  const upcomingDeadlines = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3)
  }, [projects])

  const activityFeed = useMemo(() => {
    return [...projects]
      .slice()
      .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
      .slice(0, 4)
      .map((project) => `${project.owner} updated ${project.name} (${project.updatedAt})`)
  }, [projects])

  const handleFormSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.client.trim() || !form.owner.trim() || !form.stack.trim()) {
      setFormError('Name, client, owner, and stack are required.')
      return
    }

    if (!form.dueDate || !form.budgetK) {
      setFormError('Budget and due date are required to create a delivery project.')
      return
    }

    const budgetValue = Number(form.budgetK)
    if (Number.isNaN(budgetValue) || budgetValue <= 0) {
      setFormError('Budget must be a positive number.')
      return
    }

    const nextProject = {
      id: Date.now(),
      name: form.name.trim(),
      client: form.client.trim(),
      owner: form.owner.trim(),
      stack: form.stack.trim(),
      status: 'Planning',
      priority: form.priority,
      progress: 10,
      budgetK: budgetValue,
      dueDate: form.dueDate,
      risk: form.priority === 'High' ? 'At Risk' : 'On Track',
      updatedAt: 'just now',
    }

    setProjects((prev) => [nextProject, ...prev])
    setForm(defaultForm)
    setFormError('')
  }

  const clearProjects = () => {
    setProjects(initialProjects)
    setFormError('')
  }

  const removeProject = (projectId) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectId))
  }

  const moveToNextStatus = (projectId) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== projectId) return project
        const nextStatus = cycleStatus(project.status)
        const nextProgress = nextStatus === 'Completed' ? 100 : Math.min(project.progress + 20, 95)
        return {
          ...project,
          status: nextStatus,
          progress: nextProgress,
          risk: nextStatus === 'Completed' ? 'On Track' : project.risk,
          updatedAt: 'just now',
        }
      }),
    )
  }

  const statusColor = {
    Planning: 'bg-slate-700/50 text-slate-200',
    Delivery: 'bg-blue-500/20 text-blue-300',
    Review: 'bg-amber-500/20 text-amber-300',
    Completed: 'bg-emerald-500/20 text-emerald-300',
  }

  const priorityColor = {
    Low: 'text-emerald-300',
    Medium: 'text-amber-300',
    High: 'text-rose-300',
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="mx-auto max-w-7xl px-6 pb-8 pt-12">
        <p className="inline-flex rounded-full border border-violet-400/40 bg-violet-400/10 px-3 py-1 text-xs font-medium tracking-wide text-violet-200">
          Delivery Operations Workspace
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">ClientFlow Ops</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Manage client delivery, monitor budget and risk, and keep execution aligned across teams in one
          operational dashboard.
        </p>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-6 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Portfolio Budget</p>
          <p className="mt-2 text-3xl font-semibold text-white">${analytics.totalBudget}k</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Average Progress</p>
          <p className="mt-2 text-3xl font-semibold text-white">{analytics.avgProgress}%</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Projects At Risk</p>
          <p className="mt-2 text-3xl font-semibold text-rose-300">{analytics.atRiskCount}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Delivery Rate</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">{analytics.deliveryRate}%</p>
        </article>
      </section>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 pb-16 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 xl:col-span-2">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Delivery Pipeline</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">{filteredProjects.length} visible projects</span>
              <button
                type="button"
                onClick={clearProjects}
                className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Reset Data
              </button>
            </div>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-4">
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring md:col-span-2"
              placeholder="Search by project, client, or owner"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search projects"
            />
            <select
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option>All</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              aria-label="Filter by priority"
            >
              <option>All</option>
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </div>

          <div className="mb-5 flex items-center justify-end">
            <select
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort projects"
            >
              <option value="dueDate">Sort by due date</option>
              <option value="budget">Sort by budget</option>
              <option value="progress">Sort by progress</option>
            </select>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/30 p-8 text-center">
              <p className="font-medium text-slate-200">No matching projects</p>
              <p className="mt-2 text-sm text-slate-400">Adjust filters or create a new project entry.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-violet-500/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{project.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {project.client} - Owner: {project.owner}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[project.status]}`}>
                        {project.status}
                      </span>
                      <span className={`text-xs font-semibold ${priorityColor[project.priority]}`}>
                        {project.priority} priority
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-4">
                    <p>{project.stack}</p>
                    <p>Budget: ${project.budgetK}k</p>
                    <p>Due: {project.dueDate}</p>
                    <p className={project.risk === 'At Risk' ? 'text-rose-300' : 'text-emerald-300'}>
                      {project.risk}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-violet-400 transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">Last update: {project.updatedAt}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveToNextStatus(project.id)}
                        className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200 transition hover:border-violet-400/60 hover:text-white"
                      >
                        Advance Status
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProject(project.id)}
                        className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:border-rose-400/50 hover:text-rose-300"
                        aria-label={`Remove ${project.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <form onSubmit={handleFormSubmit} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Create Project</h2>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring"
                placeholder="Project name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring"
                placeholder="Client company"
                value={form.client}
                onChange={(event) => setForm((prev) => ({ ...prev, client: event.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring"
                placeholder="Project owner"
                value={form.owner}
                onChange={(event) => setForm((prev) => ({ ...prev, owner: event.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring"
                placeholder="Tech stack"
                value={form.stack}
                onChange={(event) => setForm((prev) => ({ ...prev, stack: event.target.value }))}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring"
                  placeholder="Budget (k)"
                  value={form.budgetK}
                  onChange={(event) => setForm((prev) => ({ ...prev, budgetK: event.target.value }))}
                />
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring"
                  value={form.dueDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                />
              </div>
              <select
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-violet-500 focus:ring"
                value={form.priority}
                onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
              >
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </div>
            {formError ? <p className="mt-3 text-sm text-rose-300">{formError}</p> : null}
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-violet-500 px-4 py-2 font-medium text-white transition hover:bg-violet-400"
            >
              Create Project
            </button>
          </form>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Upcoming Deadlines</h2>
            <div className="mt-4 space-y-3">
              {upcomingDeadlines.map((project) => (
                <div key={project.id} className="rounded-lg bg-slate-950/60 p-3">
                  <p className="font-medium text-slate-100">{project.name}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {project.dueDate} - {project.owner}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Activity Feed</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {activityFeed.map((entry) => (
                <li key={entry} className="rounded-md bg-slate-950/60 px-3 py-2">
                  {entry}
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </div>
  )
}

export default App
