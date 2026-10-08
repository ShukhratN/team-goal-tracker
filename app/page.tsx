'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Filter,
  Flag,
  LayoutDashboard,
  ListTodo,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide-react'

type Status = 'On track' | 'At risk' | 'Blocked' | 'Completed'
type SubGoal = { id: string; title: string; progress: number; status: Status; target: string }
type Goal = { id: number; title: string; owner: string; team: string; status: Status; progress: number; target: string; updated: string; note?: string; blocker?: string; history: string[]; subGoals?: SubGoal[] }

function getGoalProgress(goal: Goal) {
  if (!goal.subGoals?.length) return goal.progress
  return Math.round(goal.subGoals.reduce((total, subGoal) => total + subGoal.progress, 0) / goal.subGoals.length)
}

const initialGoals: Goal[] = [
  { id: 1, title: 'Launch self-serve onboarding', owner: 'Maya Chen', team: 'Product', status: 'On track', progress: 72, target: 'Ship by Sep 30', updated: '12 min ago', note: 'Activation flow is in final QA.', history: ['Progress moved from 64% to 72%', 'Maya added a weekly activation review'], subGoals: [{ id: '1a', title: 'Map first-run journey', progress: 100, status: 'Completed', target: 'Approved flow' }, { id: '1b', title: 'Ship activation checklist', progress: 68, status: 'On track', target: 'Release by Sep 18' }, { id: '1c', title: 'Run onboarding QA', progress: 48, status: 'At risk', target: 'Zero P0 issues' }] },
  { id: 2, title: 'Reduce median API latency', owner: 'Jon Bell', team: 'Engineering', status: 'At risk', progress: 48, target: 'Under 180ms', updated: '1 hr ago', note: 'Read replica rollout is slower than planned.', history: ['Status changed to At risk', 'Jon updated target to under 180ms'], subGoals: [{ id: '2a', title: 'Instrument edge timings', progress: 72, status: 'On track', target: 'All routes covered' }, { id: '2b', title: 'Roll out read replicas', progress: 34, status: 'At risk', target: '50% traffic' }, { id: '2c', title: 'Tune slowest queries', progress: 38, status: 'At risk', target: 'Top 20 queries' }] },
  { id: 3, title: 'Build enterprise pipeline', owner: 'Priya Shah', team: 'Sales', status: 'On track', progress: 61, target: '$240k qualified', updated: '3 hrs ago', note: 'Two late-stage opportunities need security review.', history: ['Progress moved from 54% to 61%', 'Priya added a private note'], subGoals: [{ id: '3a', title: 'Qualify enterprise accounts', progress: 76, status: 'On track', target: '12 accounts' }, { id: '3b', title: 'Complete security reviews', progress: 50, status: 'On track', target: '4 reviews' }, { id: '3c', title: 'Close late-stage pipeline', progress: 57, status: 'On track', target: '$240k qualified' }] },
  { id: 4, title: 'Refresh brand narrative', owner: 'Noah Williams', team: 'Marketing', status: 'Blocked', progress: 35, target: 'Approve by Oct 04', updated: 'Yesterday', blocker: 'Waiting on customer interview transcripts from Research.', history: ['Marked Blocked', 'Noah added a blocker rationale'] },
  { id: 5, title: 'Improve weekly retention to 42%', owner: 'Elena Rossi', team: 'Growth', status: 'Completed', progress: 100, target: '42% retention', updated: 'Yesterday', note: 'Experiment series reached the target.', history: ['Goal marked Completed', 'Progress moved to 100%'] },
]

const statusStyles: Record<Status, string> = { 'On track': 'status-on-track', 'At risk': 'status-at-risk', Blocked: 'status-blocked', Completed: 'status-completed' }

function StatusPill({ status }: { status: Status }) {
  return <span className={`status-pill ${statusStyles[status]}`}><span className="status-dot" />{status}</span>
}

function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  const initials = name.split(' ').map((part) => part[0]).join('')
  return <span className={`avatar ${small ? 'avatar-small' : ''}`}>{initials}</span>
}

export default function Page() {
  const [goals, setGoals] = useState(initialGoals)
  const [view, setView] = useState<'personal' | 'team'>('personal')
  const [activePage, setActivePage] = useState<'overview' | 'my-goals' | 'team'>('overview')
  const [selectedId, setSelectedId] = useState(1)
  const [filter, setFilter] = useState<'All' | Status>('All')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const selected = goals.find((goal) => goal.id === selectedId) ?? goals[0]
  const visibleGoals = useMemo(() => goals.filter((goal) => (filter === 'All' || goal.status === filter) && `${goal.title} ${goal.owner} ${goal.team}`.toLowerCase().includes(query.toLowerCase())), [goals, filter, query])
  const counts = useMemo(() => ({ active: goals.filter((goal) => goal.status !== 'Completed').length, done: goals.filter((goal) => goal.status === 'Completed').length, risk: goals.filter((goal) => goal.status === 'At risk' || goal.status === 'Blocked').length }), [goals])

  function updateGoal(patch: Partial<Goal>) {
    if (patch.status === 'Blocked' && !(patch.blocker ?? selected.blocker)) return
    setGoals((current) => current.map((goal) => goal.id === selected.id ? { ...goal, ...patch, updated: 'Just now', history: [`${patch.status ? `Status changed to ${patch.status}` : `Progress moved to ${patch.progress}%`}`, ...goal.history] } : goal))
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand"><span className="brand-mark"><Target /></span><span>Decathlon</span><span className="brand-beta">BETA</span></div>
        <nav aria-label="Primary navigation" className="nav-list">
          <button className={`nav-item ${activePage === 'overview' ? 'nav-item-active' : ''}`} onClick={() => { setActivePage('overview'); setView('personal') }}><LayoutDashboard /> Overview</button>
          <button className={`nav-item ${activePage === 'my-goals' ? 'nav-item-active' : ''}`} onClick={() => { setActivePage('my-goals'); setView('personal') }}><ListTodo /> My goals <span className="nav-count">4</span></button>
          <button className={`nav-item ${activePage === 'team' ? 'nav-item-active' : ''}`} onClick={() => { setActivePage('team'); setView('team') }}><Users /> Team view</button>
          <button className="nav-item"><Activity /> Activity</button>
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-footer"><button className="nav-item"><CircleHelp /> Help center</button><button className="nav-item"><Settings2 /> Settings</button><div className="user-row"><Avatar name="Alex Morgan" /><div><strong>Alex Morgan</strong><span>Teammate</span></div><MoreHorizontal /></div></div>
      </aside>
      <section className="content-area">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation"><Menu /></button><div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{activePage === 'my-goals' ? 'My goals' : activePage === 'team' ? 'Team view' : 'Overview'}</strong></div><div className="topbar-actions"><span className="live-indicator"><span /> Live sync</span><button className="icon-button" aria-label="Notifications"><Bell /></button><Avatar name="Alex Morgan" small /></div></header>
        <div className="page-content">
          <div className="page-heading"><div><p className="eyebrow">Thursday, August 21, 2026</p><h1>{activePage === 'my-goals' ? 'My goals' : 'Good morning, Shukhrat.'}</h1><p className="lede">{activePage === 'my-goals' ? 'Keep your commitments visible and moving.' : 'Here&apos;s the pulse of your goals and the work moving your team forward.'}</p></div><div className="heading-actions"><div className="view-toggle" role="group" aria-label="Dashboard view"><button className={view === 'personal' ? 'toggle-active' : ''} onClick={() => setView('personal')}>My view</button><button className={view === 'team' ? 'toggle-active' : ''} onClick={() => setView('team')}>Team view</button></div><button className="primary-button" onClick={() => setShowForm(true)}><Plus /> New goal</button></div></div>
          <div className="metric-grid"><div className="metric-card metric-highlight"><div className="metric-label"><span>Goals in motion</span><ArrowUpRight /></div><strong>{counts.active}</strong><p>Across your active cycle</p><div className="metric-bar"><span style={{ width: `${Math.round((goals.filter((g) => g.status === 'On track').length / goals.length) * 100)}%` }} /></div></div><div className="metric-card"><div className="metric-label"><span>On track</span><span className="metric-swatch swatch-green" /></div><strong>{goals.filter((g) => g.status === 'On track').length}</strong><p>Goals with healthy momentum</p></div><div className="metric-card"><div className="metric-label"><span>Need attention</span><span className="metric-swatch swatch-orange" /></div><strong>{counts.risk}</strong><p>At risk or blocked</p></div><div className="metric-card"><div className="metric-label"><span>Completed</span><Check /></div><strong>{counts.done}</strong><p>Closed this cycle</p></div></div>
          <div className="section-toolbar"><div><h2>{view === 'personal' ? 'Your goals' : 'Team goals'}</h2><p>{view === 'personal' ? 'Keep your commitments visible and moving.' : 'A clear view of where the team needs support.'}</p></div><div className="toolbar-controls"><label className="search-box"><Search /><input aria-label="Search goals" placeholder="Search goals" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="filter-wrap"><button className="filter-button" onClick={() => setShowMenu(!showMenu)}><Filter /> {filter} <ChevronDown /></button>{showMenu && <div className="filter-menu">{(['All', 'On track', 'At risk', 'Blocked', 'Completed'] as const).map((item) => <button key={item} onClick={() => { setFilter(item); setShowMenu(false) }}>{item}</button>)}</div>}</div></div></div>
          <div className="dashboard-grid"><section className="goals-panel"><div className="panel-header"><span>Goal</span><span>Owner</span><span>Status</span><span>Progress</span><span>Updated</span></div>{visibleGoals.map((goal) => { const progress = getGoalProgress(goal); return <div key={goal.id}><button className={`goal-row ${selected.id === goal.id ? 'goal-row-selected' : ''}`} onClick={() => setSelectedId(goal.id)}><div className="goal-title"><span className="goal-icon"><Flag /></span><div><strong>{goal.title}</strong><span>{goal.target}{goal.subGoals?.length ? ` · ${goal.subGoals.length} sub-goals` : ''}</span></div></div><div className="owner-cell"><Avatar name={goal.owner} small /><span>{goal.owner}</span></div><StatusPill status={goal.status} /><div className="progress-cell"><div className="progress-track"><span className={`progress-fill ${statusStyles[goal.status]}`} style={{ width: `${progress}%` }} /></div><span>{progress}%</span></div><span className="updated-cell">{goal.updated}</span></button>{goal.subGoals?.map((subGoal) => <div className="subgoal-row" key={subGoal.id}><div className="subgoal-title"><span className="subgoal-branch" aria-hidden="true" /> <div><strong>{subGoal.title}</strong><span>{subGoal.target}</span></div></div><StatusPill status={subGoal.status} /><div className="progress-cell"><div className="progress-track"><span className={`progress-fill ${statusStyles[subGoal.status]}`} style={{ width: `${subGoal.progress}%` }} /></div><span>{subGoal.progress}%</span></div></div>)}</div>})}</section><aside className="detail-panel"><div className="detail-top"><div><span className="eyebrow">Selected goal</span><h2>{selected.title}</h2></div><button className="icon-button" aria-label="More goal actions"><MoreHorizontal /></button></div><div className="detail-owner"><Avatar name={selected.owner} /><div><strong>{selected.owner}</strong><span>{selected.team} · {selected.target}</span></div><StatusPill status={selected.status} /></div><div className="detail-progress"><div className="detail-progress-label"><span>Current progress</span><strong>{getGoalProgress(selected)}%</strong></div><div className="progress-track progress-track-large"><span className={`progress-fill ${statusStyles[selected.status]}`} style={{ width: `${getGoalProgress(selected)}%` }} /></div></div>{selected.status === 'Blocked' && <div className="blocker-callout"><ShieldAlert /><div><strong>Blocker</strong><p>{selected.blocker}</p></div></div>}<div className="detail-note"><span className="eyebrow">{view === 'team' ? 'Private note' : 'Latest update'}</span><p>{view === 'team' ? 'Private notes are only visible to the goal owner.' : selected.note ?? 'No update added yet.'}</p></div><div className="history"><div className="history-heading"><span className="eyebrow">Update history</span><button className="text-button">View all</button></div>{selected.history.map((item, index) => <div className="history-item" key={`${item}-${index}`}><span className="history-line" /><span className="history-dot" /><div><p>{item}</p><span>{index === 0 ? 'Just now' : 'Earlier this week'}</span></div></div>)}</div><button className="secondary-button full-width" onClick={() => setShowForm(true)}>Update goal <ArrowUpRight /></button></aside></div>
          <div className="activity-strip"><div className="activity-title"><span className="activity-pulse"><Activity /></span><div><strong>Live activity</strong><span>Changes from your team appear here in real time.</span></div></div><div className="activity-item"><Avatar name="Maya Chen" small /><span><strong>Maya</strong> updated <em>self-serve onboarding</em></span><small>12 min</small></div><div className="activity-item"><Avatar name="Jon Bell" small /><span><strong>Jon</strong> flagged <em>API latency</em> as at risk</span><small>1 hr</small></div></div>
        </div>
      </section>
      {showForm && <GoalForm goal={selected} onClose={() => setShowForm(false)} onSave={(patch) => { updateGoal(patch); setShowForm(false) }} />}
    </main>
  )
}

function GoalForm({ goal, onClose, onSave }: { goal: Goal; onClose: () => void; onSave: (patch: Partial<Goal>) => void }) {
  const [progress, setProgress] = useState(goal.progress)
  const [status, setStatus] = useState<Status>(goal.status)
  const [blocker, setBlocker] = useState(goal.blocker ?? '')
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="goal-modal" role="dialog" aria-modal="true" aria-labelledby="goal-modal-title"><div className="modal-heading"><div><span className="eyebrow">Goal update</span><h2 id="goal-modal-title">{goal.title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X /></button></div><div className="form-fields"><label>Progress <output>{progress}%</output><input type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} /></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value as Status)}><option>On track</option><option>At risk</option><option>Blocked</option><option>Completed</option></select></label>{status === 'Blocked' && <label>Blocker rationale <textarea required value={blocker} onChange={(event) => setBlocker(event.target.value)} placeholder="What is preventing progress?" /></label>}</div><div className="modal-footer"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={status === 'Blocked' && !blocker.trim()} onClick={() => onSave({ progress, status, blocker: blocker || undefined })}>Save update <Check /></button></div></section></div>
}
