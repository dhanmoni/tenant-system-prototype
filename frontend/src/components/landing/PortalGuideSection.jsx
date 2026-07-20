import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import LandingSectionIntro from './LandingSectionIntro'
import {
	ArrowRight,
	Clock,
	FileText,
	LogIn,
	Mail,
	ShieldCheck,
	UserPlus,
} from 'lucide-react'
import AuthNavLink from './AuthNavLink'
import { useLanguage } from '../../i18n'

function GuideServiceAction({ service, index }) {
	const Icon = service.icon
	const className = `portal-guide-access-action${
		service.featured ? ' portal-guide-access-action--featured' : ''
	}`

	const content = (
		<>
			<span className="portal-guide-access-action__icon" aria-hidden>
				<Icon className="h-5 w-5" strokeWidth={2.25} />
			</span>
			<span className="portal-guide-access-action__body">
				<span className="portal-guide-access-action__title-row">
					<span className="portal-guide-access-action__title">{service.title}</span>
					{service.badge ? (
						<span className="portal-guide-access-action__badge">{service.badge}</span>
					) : null}
				</span>
				<span className="portal-guide-access-action__desc">{service.description}</span>
			</span>
			<ArrowRight className="portal-guide-access-action__arrow" aria-hidden strokeWidth={2.25} />
		</>
	)

	return (
		<motion.li
			initial={{ opacity: 0, x: 12 }}
			whileInView={{ opacity: 1, x: 0 }}
			viewport={{ once: true, margin: '-40px' }}
			transition={{ duration: 0.35, delay: index * 0.06 }}
		>
			{service.authMode ? (
				<AuthNavLink mode={service.authMode} className={className}>
					{content}
				</AuthNavLink>
			) : (
				<Link to={service.to} className={className}>
					{content}
				</Link>
			)}
		</motion.li>
	)
}

function PortalGuideSection() {
	const { t } = useLanguage()

	const steps = useMemo(
		() => [
			{
				num: '1',
				title: t('home.guide.step1.title'),
				text: t('home.guide.step1.text'),
			},
			{
				num: '2',
				title: t('home.guide.step2.title'),
				text: t('home.guide.step2.text'),
			},
			{
				num: '3',
				title: t('home.guide.step3.title'),
				text: t('home.guide.step3.text'),
			},
		],
		[t],
	)

	const highlights = useMemo(
		() => [
			t('home.guide.highlight1'),
			t('home.guide.highlight2'),
			t('home.guide.highlight3'),
		],
		[t],
	)

	const services = useMemo(
		() => [
			{
				title: t('home.guide.svc.register.title'),
				description: t('home.guide.svc.register.desc'),
				authMode: 'register',
				icon: UserPlus,
			},
			{
				title: t('home.guide.svc.login.title'),
				description: t('home.guide.svc.login.desc'),
				authMode: 'login',
				icon: LogIn,
			},
			{
				title: t('home.guide.svc.uin.title'),
				description: t('home.guide.svc.uin.desc'),
				authMode: 'login',
				icon: FileText,
			},
			{
				title: t('home.guide.svc.contact.title'),
				description: t('home.guide.svc.contact.desc'),
				to: '/contact',
				icon: Mail,
			},
		],
		[t],
	)

	return (
		<section
			id="portal-guide"
			className="portal-guide-section landing-wallpaper-bg landing-wallpaper-bg--white scroll-mt-28 py-12 sm:py-16 lg:py-24"
			aria-labelledby="portal-guide-heading"
		>
			<div id="how-to-apply" className="scroll-mt-28" tabIndex={-1} aria-hidden />

			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<LandingSectionIntro
					className="mx-auto max-w-2xl"
					align="center"
					title={t('home.guide.title')}
					lead={t('home.guide.lead')}
					titleId="portal-guide-heading"
				/>

				<ol className="portal-guide-steps">
					{steps.map((step, index) => (
						<motion.li
							key={step.num}
							custom={index}
							initial={{ opacity: 0, y: 20, scale: 0.96 }}
							whileInView={{ opacity: 1, y: 0, scale: 1 }}
							viewport={{ once: true, margin: '-40px' }}
							transition={{
								type: 'spring',
								stiffness: 360,
								damping: 22,
								delay: index * 0.09,
							}}
							className="portal-guide-step"
						>
							<span className="portal-guide-step__num" aria-hidden>
								{step.num}
							</span>
							<div>
								<h3 className="portal-guide-step__title">{step.title}</h3>
								<p className="portal-guide-step__text">{step.text}</p>
							</div>
						</motion.li>
					))}
				</ol>

				<div className="portal-guide-access-layout">
					<motion.aside
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.45 }}
						className="portal-guide-access-aside"
						aria-label={t('home.guide.overview')}
					>
						<div className="portal-guide-access-aside__header">
							<ShieldCheck className="h-5 w-5 shrink-0" aria-hidden strokeWidth={2.25} />
							<p>{t('home.guide.quickAccess')}</p>
						</div>
						<div className="portal-guide-access-aside__body">
							<h3 className="portal-guide-access-aside__title">
								{t('home.guide.asideTitle')}
							</h3>
							<ul className="portal-guide-access-aside__list">
								{highlights.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
							<p className="portal-guide-access-aside__hours">
								<Clock className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2.25} />
								<span>{t('home.guide.hours')}</span>
							</p>
							<div className="portal-guide-access-aside__actions">
								<AuthNavLink
									mode="register"
									className="portal-guide-access-aside__btn-primary"
								>
									{t('home.guide.createAccount')}
								</AuthNavLink>
								<a href="#services" className="portal-guide-access-aside__btn-secondary">
									{t('home.guide.viewServices')}
								</a>
							</div>
						</div>
					</motion.aside>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.45, delay: 0.08 }}
						className="portal-guide-access-panel"
					>
						<div className="portal-guide-access-panel__header">
							<p className="portal-guide-access-panel__label">{t('home.guide.chooseService')}</p>
							<p className="portal-guide-access-panel__hint">{t('home.guide.tapHint')}</p>
						</div>
						<ul className="portal-guide-access-panel__list">
							{services.map((service, index) => (
								<GuideServiceAction key={service.title} service={service} index={index} />
							))}
						</ul>
					</motion.div>
				</div>
			</div>
		</section>
	)
}

export default PortalGuideSection
