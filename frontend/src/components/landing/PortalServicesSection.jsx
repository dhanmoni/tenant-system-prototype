import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight, Building2, FileCheck, Gavel, Landmark } from 'lucide-react'
import { portalServiceHighlights } from '../../data/portalServices'
import {
	scrollCtaVariants,
	scrollHeaderVariants,
	scrollSectionVariants,
	servicesCardHover,
	servicesCardTap,
	servicesCardVariants,
	servicesGridVariants,
} from '../../utils/landingMotion'
import LandingSectionIntro from './LandingSectionIntro'
import { useLanguage } from '../../i18n'

const SERVICE_ORDER = ['uin', 'rent-authority', 'rent-court', 'rent-tribunal']

function highlightHref(itemId) {
	return `/services#${itemId === 'uin' ? 'uin-registration' : itemId}`
}

const highlightIcons = {
	uin: FileCheck,
	'rent-authority': Building2,
	'rent-court': Gavel,
	'rent-tribunal': Landmark,
}

const highlightCopyKeys = {
	uin: {
		title: 'home.services.uin.title',
		short: 'home.services.uin.short',
		tagline: 'home.services.uin.tagline',
		desc: 'home.services.uin.desc',
	},
	'rent-authority': {
		title: 'home.services.rentAuthority.title',
		short: 'home.services.rentAuthority.short',
		tagline: 'home.services.rentAuthority.tagline',
		desc: 'home.services.rentAuthority.desc',
	},
	'rent-court': {
		title: 'home.services.rentCourt.title',
		short: 'home.services.rentCourt.short',
		tagline: 'home.services.rentCourt.tagline',
		desc: 'home.services.rentCourt.desc',
	},
	'rent-tribunal': {
		title: 'home.services.rentTribunal.title',
		short: 'home.services.rentTribunal.short',
		tagline: 'home.services.rentTribunal.tagline',
		desc: 'home.services.rentTribunal.desc',
	},
}

function PortalServicesSection() {
	const { t } = useLanguage()
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const inView = useInView(sectionRef, {
		once: true,
		amount: 0.28,
		margin: '0px 0px -12% 0px',
	})
	const reveal = Boolean(reduceMotion) || inView

	const items = useMemo(() => {
		const localized = portalServiceHighlights.map((item) => {
			const keys = highlightCopyKeys[item.id]
			if (!keys) return item
			return {
				...item,
				title: t(keys.title),
				shortLabel: t(keys.short),
				tagline: t(keys.tagline),
				description: t(keys.desc),
			}
		})
		return SERVICE_ORDER.map((id) => localized.find((item) => item.id === id)).filter(Boolean)
	}, [t])

	return (
		<section
			id="services"
			className="portal-services-showcase landing-body landing-wallpaper-bg landing-wallpaper-bg--white scroll-mt-28 py-14 sm:py-16 lg:py-20"
			aria-labelledby="services-heading"
		>
			<div className="portal-services-showcase__seam" aria-hidden />
			<div id="tenancy-authorities" className="scroll-mt-28" tabIndex={-1} aria-hidden />

			<div ref={sectionRef} className="portal-services-showcase__inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={reduceMotion ? false : 'hidden'}
					animate={reveal ? 'visible' : 'hidden'}
					variants={reduceMotion ? undefined : scrollSectionVariants}
				>
					<motion.div
						className="portal-services-showcase__header"
						variants={reduceMotion ? undefined : scrollHeaderVariants}
					>
						<LandingSectionIntro
							className="portal-services-showcase__intro"
							align="center"
							title={t('home.services.title')}
							lead={t('home.services.lead')}
							titleId="services-heading"
							animateWhen={reveal}
						/>
						<motion.div
							className="portal-services-showcase__cta-wrap"
							variants={reduceMotion ? undefined : scrollCtaVariants}
						>
							<Link to="/services" className="portal-services-showcase__cta portal-services-showcase__cta--promo">
								{t('home.services.explore')}
								<span className="portal-services-showcase__cta-icon" aria-hidden>
									<ArrowRight className="h-4 w-4" strokeWidth={2.25} />
								</span>
							</Link>
						</motion.div>
					</motion.div>

					<motion.ul
						className="portal-services-showcase__grid"
						role="list"
						variants={reduceMotion ? undefined : servicesGridVariants}
					>
						{items.map((item) => {
							const Icon = highlightIcons[item.id] || FileCheck
							return (
								<li key={item.id} className="portal-services-showcase__grid-item">
									<motion.div
										className="portal-services-showcase__card-motion"
										variants={reduceMotion ? undefined : servicesCardVariants}
										whileHover={reduceMotion ? undefined : servicesCardHover}
										whileTap={reduceMotion ? undefined : servicesCardTap}
									>
										<Link
											to={highlightHref(item.id)}
											className={`portal-services-showcase-card portal-services-showcase-card--link ${item.accent}`}
											aria-label={`${item.title}: ${item.description}`}
										>
											<span className="portal-services-showcase-card__icon" aria-hidden>
												<Icon className="portal-services-showcase-card__icon-svg" strokeWidth={1.75} />
											</span>
											<div className="portal-services-showcase-card__body">
												<p className="portal-services-showcase-card__tag">{item.tagline}</p>
												<h3 className="portal-services-showcase-card__title">{item.title}</h3>
												<p className="portal-services-showcase-card__desc">{item.description}</p>
												<span className="portal-services-showcase-card__more">
													{t('home.services.learnMore')}
													<ArrowRight className="portal-services-showcase-card__more-icon" strokeWidth={2.25} />
												</span>
											</div>
										</Link>
									</motion.div>
								</li>
							)
						})}
					</motion.ul>
				</motion.div>
			</div>
		</section>
	)
}

export default PortalServicesSection
