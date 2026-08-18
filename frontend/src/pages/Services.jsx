import { useEffect, useLayoutEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import { getPortalFormsByGroup, portalServiceSections } from '../data/portalServices'
import { useLanguage } from '../i18n'
import { APPLICATION_TYPES } from '../constants/application'
import { scrollToHashTarget } from '../utils/scrollToHash'

const sectionCopy = {
	'uin-registration': {
		title: 'services.uin.title',
		subtitle: 'services.uin.subtitle',
		when: 'services.uin.when',
		why: 'services.uin.why',
		how: [
			'services.uin.how1',
			'services.uin.how2',
			'services.uin.how3',
			'services.uin.how4',
			'services.uin.how5',
		],
		cta: 'services.uin.cta',
	},
	'rent-tribunal': {
		title: 'services.rt.title',
		when: 'services.rt.when',
		why: 'services.rt.why',
		how: ['services.rt.how1', 'services.rt.how2', 'services.rt.how3', 'services.rt.how4'],
	},
	'rent-court': {
		title: 'services.rc.title',
		when: 'services.rc.when',
		why: 'services.rc.why',
		how: ['services.rc.how1', 'services.rc.how2', 'services.rc.how3', 'services.rc.how4'],
	},
	'rent-authority': {
		title: 'services.ra.title',
		when: 'services.ra.when',
		why: 'services.ra.why',
		how: ['services.ra.how1', 'services.ra.how2', 'services.ra.how3', 'services.ra.how4'],
	},
}

const formMatterKeys = {
	[APPLICATION_TYPES.RENT_REVISION]: 'services.form.i.matter',
	[APPLICATION_TYPES.OTHER_CHARGES_REVISION]: 'services.form.ia.matter',
	[APPLICATION_TYPES.VALUER_APPOINTMENT]: 'services.form.ib.matter',
	[APPLICATION_TYPES.RENT_AUTHORITY_FILING]: 'services.form.iv.matter',
	[APPLICATION_TYPES.RENT_COURT_POSSESSION]: 'services.form.ii.matter',
	[APPLICATION_TYPES.RENT_COURT_FILING]: 'services.form.iii.matter',
	[APPLICATION_TYPES.RENT_COURT_APPEAL]: 'services.form.v.matter',
	[APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]: 'services.form.vi.matter',
}

function ServiceArticle({ section, t }) {
	const forms = section.groupId ? getPortalFormsByGroup(section.groupId) : []
	const copy = sectionCopy[section.id]
	const title = copy ? t(copy.title) : section.title
	const subtitle = copy?.subtitle ? t(copy.subtitle) : section.subtitle
	const when = copy ? t(copy.when) : section.when
	const why = copy ? t(copy.why) : section.why
	const howSteps = copy ? copy.how.map((key) => t(key)) : section.how
	const ctaLabel = copy?.cta ? t(copy.cta) : section.cta?.label

	return (
		<article
			id={section.id}
			className="gov-services-doc__article scroll-mt-28"
			aria-labelledby={`${section.id}-title`}
		>
			<h2 id={`${section.id}-title`} className="gov-services-doc__h2">
				{title}
			</h2>
			{subtitle ? <p className="gov-services-doc__subtitle">{subtitle}</p> : null}

			<h3 className="gov-services-doc__h3">{t('services.when')}</h3>
			<p>{when}</p>

			<h3 className="gov-services-doc__h3">{t('services.why')}</h3>
			<p>{why}</p>

			<h3 className="gov-services-doc__h3">{t('services.how')}</h3>
			<ol className="gov-services-doc__ol">
				{howSteps.map((step) => (
					<li key={step}>{step}</li>
				))}
			</ol>

			{forms.length > 0 ? (
				<>
					<h3 className="gov-services-doc__h3" id={`${section.groupId}-forms`}>
						{t('services.formsHeading')}
					</h3>
					<div className="gov-services-doc__table-wrap">
						<table className="gov-services-doc__table">
							<thead>
								<tr>
									<th scope="col">{t('services.formCol')}</th>
									<th scope="col">{t('services.matterCol')}</th>
									<th scope="col">{t('services.refCol')}</th>
								</tr>
							</thead>
							<tbody>
								{forms.map((form) => (
									<tr key={form.formKey}>
										<td>{form.formName}</td>
										<td>
											{formMatterKeys[form.formKey]
												? t(formMatterKeys[form.formKey])
												: form.matter}
										</td>
										<td>{form.rule}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<p className="gov-services-doc__note">
						{t('services.formsNoteBefore')}{' '}
						<strong>{t('services.formsNoteBold')}</strong> {t('services.formsNoteAfter')}
					</p>
				</>
			) : null}

			{section.cta ? (
				<p className="gov-services-doc__cta-line">
					<Link
						to={
							section.cta.anchor
								? `#${section.cta.anchor}`
								: section.cta.hash || '/#login'
						}
						className="gov-services-doc__link"
					>
						{ctaLabel}
					</Link>
				</p>
			) : null}
		</article>
	)
}

function Services() {
	const { t } = useLanguage()
	const { hash } = useLocation()

	useLayoutEffect(() => {
		if (hash) scrollToHashTarget(hash)
	}, [hash])

	useEffect(() => {
		if (!hash) return undefined
		const frame = window.requestAnimationFrame(() => {
			scrollToHashTarget(hash)
		})
		return () => window.cancelAnimationFrame(frame)
	}, [hash])


	const escalationSteps = useMemo(
		() => [
			{ step: '1', title: t('services.escalation.s1.title'), text: t('services.escalation.s1.text') },
			{ step: '2', title: t('services.escalation.s2.title'), text: t('services.escalation.s2.text') },
			{ step: '3', title: t('services.escalation.s3.title'), text: t('services.escalation.s3.text') },
			{ step: '4', title: t('services.escalation.s4.title'), text: t('services.escalation.s4.text') },
		],
		[t],
	)

	const toc = useMemo(
		() => [
			{ id: 'which-authority', label: t('services.escalation.title') },
			...portalServiceSections.map((s) => ({
				id: s.id,
				label: sectionCopy[s.id] ? t(sectionCopy[s.id].title) : s.title,
			})),
		],
		[t],
	)

	return (
		<PublicPageLayout
			title={t('services.title')}
			titleId="services-page-heading"
			breadcrumbLabel={t('services.breadcrumb')}
			lead={t('services.lead')}
		>
			<div className="gov-services-doc">
				<nav className="gov-services-doc__toc" aria-label={t('services.toc')}>
					<h2 className="gov-services-doc__toc-title">{t('services.toc')}</h2>
					<ol className="gov-services-doc__toc-list">
						{toc.map((item) => (
							<li key={item.id}>
								<Link
									to={{ pathname: '/services', hash: `#${item.id}` }}
									className="gov-services-doc__toc-link"
								>
									{item.label}
								</Link>
							</li>
						))}
					</ol>
				</nav>

				<div className="gov-services-doc__main">
					<section
						id="which-authority"
						className="gov-services-doc__article scroll-mt-28"
						aria-labelledby="which-authority-title"
					>
						<h2 id="which-authority-title" className="gov-services-doc__h2">
							{t('services.escalation.title')}
						</h2>
						<p>{t('services.escalation.lead')}</p>
						<ol className="gov-services-doc__ol gov-services-doc__ol--authorities">
							{escalationSteps.map((item) => (
								<li key={item.step}>
									<strong>{item.title}</strong> — {item.text}
								</li>
							))}
						</ol>
					</section>

					{portalServiceSections.map((section) => (
						<ServiceArticle key={section.id} section={section} t={t} />
					))}

					<footer className="gov-services-doc__footer">
						<h2 className="gov-services-doc__h2">{t('services.applyTitle')}</h2>
						<p>
							{t('services.applyLeadBefore')}{' '}
							<Link to="/" className="gov-services-doc__link">
								{t('services.applyHome')}
							</Link>{' '}
							{t('services.applyLeadAfter')}
						</p>
						<p className="gov-services-doc__footer-actions">
							<Link to="/#register" className="gov-services-doc__btn gov-services-doc__btn--primary">
								{t('services.createAccount')}
							</Link>
							<Link to="/#login" className="gov-services-doc__btn gov-services-doc__btn--outline">
								{t('services.signIn')}
							</Link>
						</p>
					</footer>
				</div>
			</div>
		</PublicPageLayout>
	)
}

export default Services
