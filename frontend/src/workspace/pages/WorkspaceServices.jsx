import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/dashboard/Icons'
import { getAllServiceForms, getFormApplyLabel, tenantServiceGroups } from '../../data/tenantServices'
import { ROLES } from '../../constants/roles'

const GROUP_ACCENTS = {
	'rent-authority': { chip: 'Sec. 30', short: 'Rent Authority' },
	'rent-court': { chip: 'Sec. 33', short: 'Rent Court' },
	'rent-tribunal': { chip: 'Sec. 34', short: 'Rent Tribunal' },
}

function ServiceFormRow({ form, groupId }) {
	const navigate = useNavigate()
	const location = useLocation()
	const isActive = location.pathname === form.to

	const handleActivate = () => navigate(form.to)

	return (
		<tr
			className={`ws-services-row${isActive ? ' is-active' : ''}`}
			tabIndex={0}
			role="link"
			aria-current={isActive ? 'page' : undefined}
			onClick={handleActivate}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					handleActivate()
				}
			}}
		>
			<td className="ws-services-cell-form">
				<span className={`ws-services-form-badge ws-services-form-badge--${groupId}`}>
					{form.formName}
				</span>
			</td>
			<td className="ws-services-cell-desc">
				<span className="ws-services-cell-title" title={form.label}>
					{form.label}
				</span>
				<span className="ws-services-cell-matter" title={form.matter}>
					{form.matter}
				</span>
			</td>
			<td className="ws-services-cell-rule">
				<span className="ws-services-rule-tag">{form.rule}</span>
			</td>
			<td className="ws-services-cell-action">
				<span className="ws-services-row-cta">
					<span className="ws-services-row-cta-label">{getFormApplyLabel(form)}</span>
					<Icon name="chevron" />
				</span>
			</td>
		</tr>
	)
}

function ServiceFormCard({ form, groupId }) {
	const navigate = useNavigate()
	const location = useLocation()
	const isActive = location.pathname === form.to

	return (
		<button
			type="button"
			className={`ws-services-card${isActive ? ' is-active' : ''}`}
			aria-current={isActive ? 'page' : undefined}
			onClick={() => navigate(form.to)}
		>
			<div className="ws-services-card__top">
				<span className={`ws-services-form-badge ws-services-form-badge--${groupId}`}>
					{form.formName}
				</span>
				<span className="ws-services-rule-tag">{form.rule}</span>
			</div>
			<span className="ws-services-card__title">{form.label}</span>
			<span className="ws-services-card__matter">{form.matter}</span>
			<span className="ws-services-card__cta">
				{getFormApplyLabel(form)}
				<Icon name="chevron" />
			</span>
		</button>
	)
}

function WorkspaceServices() {
	const { user } = useOutletContext()
	const [searchParams] = useSearchParams()
	const [activeGroup, setActiveGroup] = useState('all')

	useEffect(() => {
		const authority = searchParams.get('authority')
		if (authority && tenantServiceGroups.some((g) => g.id === authority)) {
			setActiveGroup(authority)
		}
	}, [searchParams])

	if (user?.role !== ROLES.USER) {
		return <Navigate to="/dashboard" replace />
	}

	const totalForms = useMemo(() => getAllServiceForms().length, [])

	const catalogGroups = useMemo(() => {
		if (activeGroup === 'all') return tenantServiceGroups
		return tenantServiceGroups.filter((g) => g.id === activeGroup)
	}, [activeGroup])

	return (
		<div className="ws-page ws-services-page">
			<nav className="ws-breadcrumb" aria-label="Breadcrumb">
				<Link to="/dashboard">Dashboard</Link>
				<span className="ws-breadcrumb-sep">/</span>
				<span>All services</span>
			</nav>

			<header className="ws-services-head">
				<div className="ws-services-head-text">
					<h1 className="ws-services-title">Services under the Assam Tenancy Act 2021</h1>
					<p className="ws-services-lead">
						Browse forms by competent authority. Select a row to open the application.
					</p>
				</div>
				<dl className="ws-services-stats" aria-label="Service summary">
					<div>
						<dt>Authorities</dt>
						<dd>{tenantServiceGroups.length}</dd>
					</div>
					<div>
						<dt>Forms</dt>
						<dd>{totalForms}</dd>
					</div>
				</dl>
			</header>

			<div
				className="ws-services-filters"
				role="tablist"
				aria-label="Filter by authority"
			>
				<button
					type="button"
					role="tab"
					className={`ws-services-filter${activeGroup === 'all' ? ' is-active' : ''}`}
					aria-selected={activeGroup === 'all'}
					onClick={() => setActiveGroup('all')}
				>
					All
				</button>
				{tenantServiceGroups.map((group) => (
					<button
						key={group.id}
						type="button"
						role="tab"
						className={`ws-services-filter ws-services-filter--${group.id}${
							activeGroup === group.id ? ' is-active' : ''
						}`}
						aria-selected={activeGroup === group.id}
						onClick={() => setActiveGroup(group.id)}
					>
						{GROUP_ACCENTS[group.id]?.short || group.title}
					</button>
				))}
			</div>

			<div className="ws-services-catalog">
				{catalogGroups.map((group) => (
					<section
						key={group.id}
						className={`ws-card ws-services-catalog-section ws-services-catalog-section--${group.id}`}
						aria-labelledby={`ws-services-catalog-${group.id}`}
					>
						<div className="ws-card-header ws-services-catalog-header">
							<div className="ws-services-catalog-heading">
								<p className="ws-services-catalog-kicker">
									{GROUP_ACCENTS[group.id]?.chip || 'Authority'}
								</p>
								<h2
									id={`ws-services-catalog-${group.id}`}
									className="ws-card-title"
								>
									{group.title}
								</h2>
							</div>
							<span className="ws-services-catalog-count">
								{group.forms.length} form{group.forms.length === 1 ? '' : 's'}
							</span>
						</div>

						<div className="ws-card-body ws-table-wrap ws-services-table-wrap">
							<table className="ws-table ws-services-table">
								<colgroup>
									<col className="ws-services-col-form" />
									<col className="ws-services-col-desc" />
									<col className="ws-services-col-rule" />
									<col className="ws-services-col-action" />
								</colgroup>
								<thead>
									<tr>
										<th scope="col" className="ws-services-th-form">
											Form
										</th>
										<th scope="col">Application</th>
										<th scope="col" className="ws-services-th-rule">
											Rule
										</th>
										<th scope="col" className="ws-services-th-action">
											<span className="ws-sr-only">Action</span>
										</th>
									</tr>
								</thead>
								<tbody>
									{group.forms.map((form) => (
										<ServiceFormRow
											key={form.to}
											form={form}
											groupId={group.id}
										/>
									))}
								</tbody>
							</table>
						</div>

						<div className="ws-services-card-list" aria-label={`${group.title} forms`}>
							{group.forms.map((form) => (
								<ServiceFormCard
									key={`card-${form.to}`}
									form={form}
									groupId={group.id}
								/>
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	)
}

export default WorkspaceServices
