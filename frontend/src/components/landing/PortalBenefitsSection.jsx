import { useMemo, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ClipboardList, Landmark, ShieldCheck } from 'lucide-react'
import { portalBenefitItems } from '../../data/portalBenefits'
import {
	scrollCardVariants,
	scrollGridVariants,
	scrollHeaderVariants,
	scrollSectionVariants,
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
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const sectionInView = useInView(sectionRef, {
		once: true,
		margin: '-12% 0px -8% 0px',
	})
	const reveal = reduceMotion || sectionInView

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
			ref={sectionRef}
			id="portal-benefits"
			className={`portal-benefits landing-body landing-wallpaper-bg landing-wallpaper-bg--cream scroll-mt-28 py-14 sm:py-16 lg:py-20${className ? ` ${className}` : ''}`}
			aria-labelledby="portal-benefits-heading"
		>
			<motion.div
				className="portal-benefits__shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
				initial={reduceMotion ? false : 'hidden'}
				animate={reveal ? 'visible' : 'hidden'}
				variants={reduceMotion ? undefined : scrollSectionVariants}
			>
				<motion.header
					className="portal-benefits__header"
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

				<motion.ul
					className="portal-benefits__grid"
					role="list"
					variants={reduceMotion ? undefined : scrollGridVariants}
				>
					{items.map((item) => {
						const Icon = iconMap[item.icon] || Landmark
						return (
							<motion.li
								key={item.id}
								className={`portal-benefits-item portal-benefits-item--${item.id}`}
								role="listitem"
								variants={reduceMotion ? undefined : scrollCardVariants}
							>
								<span className="portal-benefits-item__icon" aria-hidden>
									<Icon className="portal-benefits-item__icon-svg" strokeWidth={1.75} />
								</span>
								<div className="portal-benefits-item__content">
									<h3 className="portal-benefits-item__title">{item.title}</h3>
									<p className="portal-benefits-item__desc">{item.description}</p>
								</div>
							</motion.li>
						)
					})}
				</motion.ul>
			</motion.div>
		</section>
	)
}

export default PortalBenefitsSection
