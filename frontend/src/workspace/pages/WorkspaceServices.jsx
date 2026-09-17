import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { Icon } from '../../components/dashboard/Icons'
import { tenantServiceGroups } from '../../data/tenantServices'
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

const AUTHORITY_ICONS = {
	'rent-authority': 'landmark',
	'rent-court': 'gavel',
	'rent-tribunal': 'scale',
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

function ServiceFormItem({ form, groupId, t }) {
	const navigate = useNavigate()
	const location = useLocation()
	const isActive = location.pathname === form.to
	const copy = translateForm(form, t)

	return (
		<li>
			<button
				type="button"
				className={`ws-services-form-row ws-services-form-row--${groupId}${isActive ? ' is-active' : ''}`}
				aria-current={isActive ? 'page' : undefined}
				onClick={() => navigate(form.to)}
			>
				<span className="ws-services-form-id">
					<span className={`ws-services-form-badge ws-services-form-badge--${groupId}`}>
						{copy.formName}
					</span>
				</span>
				<span className="ws-services-form-row__copy">
					<span className="ws-services-form-row__title">{copy.matter}</span>
				</span>
				<span className="ws-services-form-row__apply">{t('ws.services.applyForm')}</span>
			</button>
		</li>
	)
}

function WorkspaceServices() {
	const { user } = useOutletContext()
	const { t } = useLanguage()
	const location = useLocation()
	const [searchParams, setSearchParams] = useSearchParams()
	const authorityParam = searchParams.get('authority')
	const [activeGroup, setActiveGroup] = useState(() => {
		if (authorityParam && tenantServiceGroups.some((g) => g.id === authorityParam)) {
			return authorityParam
		}
		return 'all'
	})

	useEffect(() => {
		const main = document.getElementById('dashboard-primary-content')
		if (main?.scrollTo) {
			main.scrollTo({ top: 0, left: 0, behavior: 'auto' })
		} else if (main) {
			main.scrollTop = 0
		}
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
	}, [location.key])

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
		return <Navigate to="/403" replace />
	}

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
			</header>

			<div
				className={`ws-services-filters ws-services-filters--${activeGroup}`}
				role="tablist"
				aria-label={t('ws.services.filter.aria')}
			>
				<button
					type="button"
					role="tab"
					className={`ws-services-filter ws-services-filter--all${activeGroup === 'all' ? ' is-active' : ''}`}
					aria-selected={activeGroup === 'all'}
					onClick={() => selectGroup('all')}
				>
					<span className="ws-services-filter__icon" aria-hidden>
						<Icon name="services" />
					</span>
					<span className="ws-services-filter__label">{t('ws.services.filter.all')}</span>
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
						<span className="ws-services-filter__icon" aria-hidden>
							<Icon name={AUTHORITY_ICONS[group.id]} />
						</span>
						<span className="ws-services-filter__label">
							{t(AUTHORITY_TITLE_KEYS[group.id] || group.title)}
						</span>
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
								<div className="ws-services-catalog-identity">
									<span className="ws-services-catalog-icon" aria-hidden>
										<Icon name={AUTHORITY_ICONS[group.id] || 'services'} />
									</span>
									<div className="ws-services-catalog-heading">
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
								</div>
								<span className="ws-services-catalog-count">{formCountLabel}</span>
							</div>

							<div className="ws-services-list-head" aria-hidden="true">
								<span>{t('ws.services.col.form')}</span>
								<span>{t('ws.services.col.application')}</span>
								<span>{t('ws.services.col.action')}</span>
							</div>
							<ul className="ws-services-list" aria-label={title}>
								{group.forms.map((form) => (
									<ServiceFormItem
										key={form.to}
										form={form}
										groupId={group.id}
										t={t}
									/>
								))}
							</ul>
						</section>
					)
				})}
			</div>
		</div>
	)
}

export default WorkspaceServices
