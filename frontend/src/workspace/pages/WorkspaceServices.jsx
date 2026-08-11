import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/dashboard/Icons'
import { getAllServiceForms, tenantServiceGroups } from '../../data/tenantServices'
import { APPLICATION_TYPES } from '../../constants/application'
import { ROLES } from '../../constants/roles'
import { useLanguage } from '../../i18n'

const AUTHORITY_TITLE_KEYS = {
	'rent-authority': 'ws.citizen.authority.rentAuthority',
	'rent-court': 'ws.citizen.authority.rentCourt',
	'rent-tribunal': 'ws.citizen.authority.rentTribunal',
}

const AUTHORITY_DESC_KEYS = {
	'rent-authority': 'ws.services.authority.desc.rentAuthority',
	'rent-court': 'ws.services.authority.desc.rentCourt',
	'rent-tribunal': 'ws.services.authority.desc.rentTribunal',
}

const AUTHORITY_CHIP_KEYS = {
	'rent-authority': 'ws.services.chip.sec30',
	'rent-court': 'ws.services.chip.sec33',
	'rent-tribunal': 'ws.services.chip.sec34',
}

const FORM_I18N_KEYS = {
	[APPLICATION_TYPES.RENT_REVISION]: {
		name: 'ws.services.form.i.name',
		matter: 'ws.services.form.i.matter',
		label: 'ws.services.form.i.label',
	},
	[APPLICATION_TYPES.OTHER_CHARGES_REVISION]: {
		name: 'ws.services.form.ia.name',
		matter: 'ws.services.form.ia.matter',
		label: 'ws.services.form.ia.label',
	},
	[APPLICATION_TYPES.VALUER_APPOINTMENT]: {
		name: 'ws.services.form.ib.name',
		matter: 'ws.services.form.ib.matter',
		label: 'ws.services.form.ib.label',
	},
	[APPLICATION_TYPES.RENT_AUTHORITY_FILING]: {
		name: 'ws.services.form.iv.name',
		matter: 'ws.services.form.iv.matter',
		label: 'ws.services.form.iv.label',
	},
	[APPLICATION_TYPES.RENT_COURT_POSSESSION]: {
		name: 'ws.services.form.ii.name',
		matter: 'ws.services.form.ii.matter',
		label: 'ws.services.form.ii.label',
	},
	[APPLICATION_TYPES.RENT_COURT_FILING]: {
		name: 'ws.services.form.iii.name',
		matter: 'ws.services.form.iii.matter',
		label: 'ws.services.form.iii.label',
	},
	[APPLICATION_TYPES.RENT_COURT_APPEAL]: {
		name: 'ws.services.form.v.name',
		matter: 'ws.services.form.v.matter',
		label: 'ws.services.form.v.label',
	},
	[APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]: {
		name: 'ws.services.form.vi.name',
		matter: 'ws.services.form.vi.matter',
		label: 'ws.services.form.vi.label',
	},
}

function translateForm(form, t) {
	const keys = FORM_I18N_KEYS[form.formKey]
	if (!keys) {
		return {
			formName: form.formName,
			matter: form.matter,
			label: form.label,
		}
	}
	return {
		formName: t(keys.name),
		matter: t(keys.matter),
		label: t(keys.label),
	}
}

function ServiceFormRow({ form, groupId, t }) {
	const navigate = useNavigate()
	const location = useLocation()
	const isActive = location.pathname === form.to
	const copy = translateForm(form, t)

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
					{copy.formName}
				</span>
			</td>
			<td className="ws-services-cell-desc">
				<span className="ws-services-cell-title" title={copy.matter}>
					{copy.matter}
				</span>
				<span className="ws-services-cell-meta" title={copy.label}>
					{copy.label}
				</span>
			</td>
			<td className="ws-services-cell-action">
				<span className="ws-services-row-cta">
					<span className="ws-services-row-cta-label">{t('ws.services.applyForm')}</span>
					<Icon name="chevron" />
				</span>
			</td>
		</tr>
	)
}

function ServiceFormCard({ form, groupId, t }) {
	const navigate = useNavigate()
	const location = useLocation()
	const isActive = location.pathname === form.to
	const copy = translateForm(form, t)

	return (
		<button
			type="button"
			className={`ws-services-card ws-services-card--${groupId}${isActive ? ' is-active' : ''}`}
			aria-current={isActive ? 'page' : undefined}
			onClick={() => navigate(form.to)}
		>
			<div className="ws-services-card__top">
				<span className={`ws-services-form-badge ws-services-form-badge--${groupId}`}>
					{copy.formName}
				</span>
			</div>
			<span className="ws-services-card__title">{copy.matter}</span>
			{copy.label ? (
				<span className="ws-services-card__meta" title={copy.label}>
					{copy.label}
				</span>
			) : null}
			<span className="ws-services-card__cta">
				{t('ws.services.applyForm')}
				<Icon name="chevron" />
			</span>
		</button>
	)
}

function WorkspaceServices() {
	const { user } = useOutletContext()
	const { t } = useLanguage()
	const [searchParams, setSearchParams] = useSearchParams()
	const authorityParam = searchParams.get('authority')
	const [activeGroup, setActiveGroup] = useState(() => {
		if (authorityParam && tenantServiceGroups.some((g) => g.id === authorityParam)) {
			return authorityParam
		}
		return 'all'
	})

	useEffect(() => {
		if (authorityParam && tenantServiceGroups.some((g) => g.id === authorityParam)) {
			setActiveGroup(authorityParam)
		} else if (!authorityParam) {
			setActiveGroup('all')
		}
	}, [authorityParam])

	useEffect(() => {
		/* Warm FormPortal + individual form chunks while browsing the catalog */
		void import('../../pages/dashboard/FormPortal').then((mod) => {
			mod.prefetchServiceFormPanels?.()
		})
	}, [])

	const selectGroup = (groupId) => {
		setActiveGroup(groupId)
		if (groupId === 'all') {
			setSearchParams({}, { replace: true })
		} else {
			setSearchParams({ authority: groupId }, { replace: true })
		}
	}

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
			<header className="ws-services-head">
				<div className="ws-services-head-text">
					<h1 className="ws-services-title">{t('ws.services.title')}</h1>
					<p className="ws-services-lead">{t('ws.services.lead')}</p>
				</div>
				<dl className="ws-services-stats" aria-label={t('ws.services.stats.aria')}>
					<div>
						<dt>{t('ws.services.stats.authorities')}</dt>
						<dd>{tenantServiceGroups.length}</dd>
					</div>
					<div>
						<dt>{t('ws.services.stats.forms')}</dt>
						<dd>{totalForms}</dd>
					</div>
				</dl>
			</header>

			<div
				className="ws-services-filters"
				role="tablist"
				aria-label={t('ws.services.filter.aria')}
			>
				<button
					type="button"
					role="tab"
					className={`ws-services-filter${activeGroup === 'all' ? ' is-active' : ''}`}
					aria-selected={activeGroup === 'all'}
					onClick={() => selectGroup('all')}
				>
					{t('ws.services.filter.all')}
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
						onClick={() => selectGroup(group.id)}
					>
						{t(AUTHORITY_TITLE_KEYS[group.id] || group.title)}
					</button>
				))}
			</div>

			<div className="ws-services-catalog">
				{catalogGroups.map((group) => {
					const title = t(AUTHORITY_TITLE_KEYS[group.id] || group.title)
					const formCountLabel =
						group.forms.length === 1
							? t('ws.services.count.formOne', { count: group.forms.length })
							: t('ws.services.count.forms', { count: group.forms.length })

					return (
						<section
							key={group.id}
							className={`ws-card ws-services-catalog-section ws-services-catalog-section--${group.id}`}
							aria-labelledby={`ws-services-catalog-${group.id}`}
						>
							<div className="ws-card-header ws-services-catalog-header">
								<div className="ws-services-catalog-heading">
									<p className="ws-services-catalog-kicker">
										{t(AUTHORITY_CHIP_KEYS[group.id] || 'ws.services.chip.authority')}
									</p>
									<h2
										id={`ws-services-catalog-${group.id}`}
										className="ws-card-title"
									>
										{title}
									</h2>
									{AUTHORITY_DESC_KEYS[group.id] ? (
										<p className="ws-services-catalog-desc">
											{t(AUTHORITY_DESC_KEYS[group.id])}
										</p>
									) : null}
								</div>
								<span className="ws-services-catalog-count">{formCountLabel}</span>
							</div>

							<div className="ws-card-body ws-table-wrap ws-services-table-wrap">
								<table className="ws-table ws-services-table">
									<colgroup>
										<col className="ws-services-col-form" />
										<col className="ws-services-col-desc" />
										<col className="ws-services-col-action" />
									</colgroup>
									<thead>
										<tr>
											<th scope="col" className="ws-services-th-form">
												{t('ws.services.col.form')}
											</th>
											<th scope="col">{t('ws.services.col.application')}</th>
											<th scope="col" className="ws-services-th-action">
												<span className="ws-sr-only">{t('ws.services.col.action')}</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{group.forms.map((form) => (
											<ServiceFormRow
												key={form.to}
												form={form}
												groupId={group.id}
												t={t}
											/>
										))}
									</tbody>
								</table>
							</div>

							<div className="ws-services-card-list" aria-label={title}>
								{group.forms.map((form) => (
									<ServiceFormCard
										key={`card-${form.to}`}
										form={form}
										groupId={group.id}
										t={t}
									/>
								))}
							</div>
						</section>
					)
				})}
			</div>
		</div>
	)
}

export default WorkspaceServices
