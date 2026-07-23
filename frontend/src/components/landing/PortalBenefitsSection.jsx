import { useMemo, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ClipboardList, Landmark, ShieldCheck } from 'lucide-react'
import { portalBenefitItems } from '../../data/portalBenefits'
import {
	benefitsModernCardHover,
	benefitsModernCardTap,
	benefitsModernCardVariants,
	benefitsModernGridVariants,
	scrollHeaderVariants,
} from '../../utils/landingMotion'
import LandingSectionIntro from './LandingSectionIntro'
import { useLanguage } from '../../i18n'

const iconMap = {
	landmark: Landmark,
	clipboardList: ClipboardList,
	shieldCheck: ShieldCheck,
}

const benefitCopyKeys = {
	services: {
		title: 'home.benefits.services.title',
		description: 'home.benefits.services.desc',
	},
	tracking: {
		title: 'home.benefits.tracking.title',
		description: 'home.benefits.tracking.desc',
	},
	records: {
		title: 'home.benefits.records.title',
		description: 'home.benefits.records.desc',
	},
}

function PortalBenefitsSection({ className = '' }) {
	const { t } = useLanguage()
	const headerRef = useRef(null)
	const cardsRef = useRef(null)
	const reduceMotion = useReducedMotion()

	// Header and cards each wait until they are actually on screen
	const headerInView = useInView(headerRef, {
		once: true,
		amount: 0.55,
		margin: '0px 0px -8% 0px',
	})
	const cardsInView = useInView(cardsRef, {
		once: true,
		amount: 0.35,
		margin: '0px 0px -12% 0px',
	})

	const revealHeader = Boolean(reduceMotion) || headerInView
	const revealCards = Boolean(reduceMotion) || cardsInView

	const items = useMemo(
		() =>
			portalBenefitItems.map((item) => {
				const keys = benefitCopyKeys[item.id]
				return {
					...item,
					title: keys ? t(keys.title) : item.title,
					description: keys ? t(keys.description) : item.description,
				}
			}),
		[t],
	)

	return (
		<section
			id="portal-benefits"
			className={`portal-benefits landing-body landing-wallpaper-bg landing-wallpaper-bg--cream scroll-mt-28 py-14 sm:py-16 lg:py-20${className ? ` ${className}` : ''}`}
			aria-labelledby="portal-benefits-heading"
		>
			<div className="portal-benefits__shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.header
					ref={headerRef}
					className="portal-benefits__header"
					initial={reduceMotion ? false : 'hidden'}
					animate={revealHeader ? 'visible' : 'hidden'}
					variants={reduceMotion ? undefined : scrollHeaderVariants}
				>
					<LandingSectionIntro
						className="portal-benefits__intro"
						align="center"
						title={t('home.benefits.title')}
						lead={t('home.benefits.lead')}
						titleId="portal-benefits-heading"
						animateWhen={revealHeader}
					/>
				</motion.header>

				<motion.ul
					ref={cardsRef}
					className="portal-benefits__grid"
					role="list"
					initial={reduceMotion ? false : 'hidden'}
					animate={revealCards ? 'visible' : 'hidden'}
					variants={reduceMotion ? undefined : benefitsModernGridVariants}
				>
					{items.map((item) => {
						const Icon = iconMap[item.icon] || Landmark
						return (
							<li key={item.id} className="portal-benefits__grid-item" role="listitem">
								<motion.div
									className="portal-benefits__card-motion"
									variants={reduceMotion ? undefined : benefitsModernCardVariants}
									whileHover={reduceMotion ? undefined : benefitsModernCardHover}
									whileTap={reduceMotion ? undefined : benefitsModernCardTap}
								>
									<article className={`portal-benefits-item portal-benefits-item--${item.id}`}>
										<span className="portal-benefits-item__icon" aria-hidden>
											<Icon className="portal-benefits-item__icon-svg" strokeWidth={1.75} />
										</span>
										<div className="portal-benefits-item__content">
											<h3 className="portal-benefits-item__title">{item.title}</h3>
											<p className="portal-benefits-item__desc">{item.description}</p>
										</div>
									</article>
								</motion.div>
							</li>
						)
					})}
				</motion.ul>
			</div>
		</section>
	)
}

export default PortalBenefitsSection
