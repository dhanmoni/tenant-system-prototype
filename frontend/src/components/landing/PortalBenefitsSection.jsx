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
import PortalBenefitsVector from './PortalBenefitsVector'
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
	const layoutRef = useRef(null)
	const reduceMotion = useReducedMotion()

	const inView = useInView(layoutRef, {
		once: true,
		amount: 0.25,
		margin: '0px 0px -8% 0px',
	})
	const reveal = Boolean(reduceMotion) || inView

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
			className={`portal-benefits landing-body landing-wallpaper-bg landing-wallpaper-bg--cream scroll-mt-28 pt-14 sm:pt-16 lg:pt-20 pb-8 sm:pb-10 lg:pb-12${className ? ` ${className}` : ''}`}
			aria-labelledby="portal-benefits-heading"
		>
			<div className="portal-benefits__shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.header
					className="portal-benefits__header"
					initial={reduceMotion ? false : 'hidden'}
					animate={reveal ? 'visible' : 'hidden'}
					variants={reduceMotion ? undefined : scrollHeaderVariants}
				>
					<LandingSectionIntro
						className="portal-benefits__intro"
						align="center"
						title={t('home.benefits.title')}
						lead={t('home.benefits.lead')}
						titleId="portal-benefits-heading"
						animateWhen={reveal}
					/>
				</motion.header>

				<div ref={layoutRef} className="portal-benefits__body">
					<motion.aside
						className="portal-benefits__visual"
						aria-hidden
						initial={reduceMotion ? false : { opacity: 0, x: -24, scale: 0.97 }}
						animate={
							reveal
								? { opacity: 1, x: 0, scale: 1 }
								: { opacity: 0, x: -24, scale: 0.97 }
						}
						transition={
							reduceMotion
								? { duration: 0 }
								: { type: 'spring', stiffness: 170, damping: 22, delay: 0.06 }
						}
					>
						<div className="portal-benefits__visual-glow" />
						<div className="portal-benefits__visual-frame">
							<PortalBenefitsVector className="portal-benefits__vector" />
						</div>
					</motion.aside>

					<motion.ul
						className="portal-benefits__grid"
						role="list"
						initial={reduceMotion ? false : 'hidden'}
						animate={reveal ? 'visible' : 'hidden'}
						variants={reduceMotion ? undefined : benefitsModernGridVariants}
					>
						{items.map((item, index) => {
							const Icon = iconMap[item.icon] || Landmark
							const step = String(index + 1).padStart(2, '0')
							return (
								<li key={item.id} className="portal-benefits__grid-item" role="listitem">
									<motion.div
										className="portal-benefits__card-motion"
										custom={index}
										variants={reduceMotion ? undefined : benefitsModernCardVariants}
										whileHover={reduceMotion ? undefined : benefitsModernCardHover}
										whileTap={reduceMotion ? undefined : benefitsModernCardTap}
									>
										<article
											className={`portal-benefits-item portal-benefits-item--${item.id}`}
										>
											<span className="portal-benefits-item__index" aria-hidden>
												{step}
											</span>
											<span className="portal-benefits-item__icon" aria-hidden>
												<Icon
													className="portal-benefits-item__icon-svg"
													strokeWidth={1.75}
												/>
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
			</div>
		</section>
	)
}

export default PortalBenefitsSection
