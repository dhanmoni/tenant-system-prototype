import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ClipboardList, Landmark, ShieldCheck } from 'lucide-react'
import { portalBenefitItems, portalBenefitsIntro } from '../../data/portalBenefits'
import {
	benefitsItemContentVariants,
	benefitsItemDividerVariants,
	benefitsItemIconVariants,
	benefitsItemRowVariants,
	benefitsItemVariants,
	benefitsListRuleVariants,
	benefitsListVariants,
} from '../../utils/landingMotion'
import LandingSectionIntro from './LandingSectionIntro'

const iconMap = {
	landmark: Landmark,
	clipboardList: ClipboardList,
	shieldCheck: ShieldCheck,
}

function PortalBenefitsSection({ className = '' }) {
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const sectionInView = useInView(sectionRef, { once: true, margin: '-12% 0px -10% 0px' })
	const reveal = reduceMotion || sectionInView

	return (
		<section
			ref={sectionRef}
			id="portal-benefits"
			className={`portal-benefits landing-body landing-wallpaper-bg landing-wallpaper-bg--cream py-14 sm:py-16 lg:py-20${className ? ` ${className}` : ''}`}
			aria-labelledby="portal-benefits-heading"
		>
			<div className="portal-benefits__shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="portal-benefits__inner">
					<LandingSectionIntro
						className="portal-benefits__intro"
						align="center"
						title={portalBenefitsIntro.title}
						lead={portalBenefitsIntro.lead}
						titleId="portal-benefits-heading"
					/>

					<motion.div
						className="portal-benefits__list-wrap"
						initial={reduceMotion ? false : 'hidden'}
						animate={reveal ? 'visible' : 'hidden'}
						variants={reduceMotion ? undefined : benefitsListVariants}
					>
						<motion.div
							className="portal-benefits__list-rule"
							aria-hidden
							variants={reduceMotion ? undefined : benefitsListRuleVariants}
						/>

						<ul className="portal-benefits__list">
							{portalBenefitItems.map((item) => {
								const Icon = iconMap[item.icon] || Landmark
								return (
									<motion.li
										key={item.id}
										className={`portal-benefits-item portal-benefits-item--${item.id}`}
										variants={reduceMotion ? undefined : benefitsItemVariants}
									>
										<motion.div
											className="portal-benefits-item__divider"
											aria-hidden
											variants={reduceMotion ? undefined : benefitsItemDividerVariants}
										/>
										<motion.div
											className="portal-benefits-item__row"
											variants={reduceMotion ? undefined : benefitsItemRowVariants}
										>
											<motion.span
												className="portal-benefits-item__icon"
												aria-hidden
												variants={reduceMotion ? undefined : benefitsItemIconVariants}
											>
												<Icon
													className="portal-benefits-item__icon-svg"
													strokeWidth={1.75}
												/>
											</motion.span>
											<motion.div
												className="portal-benefits-item__content"
												variants={reduceMotion ? undefined : benefitsItemContentVariants}
											>
												<h3 className="portal-benefits-item__title">{item.title}</h3>
												<p className="portal-benefits-item__desc">{item.description}</p>
											</motion.div>
										</motion.div>
									</motion.li>
								)
							})}
						</ul>
					</motion.div>
				</div>
			</div>
		</section>
	)
}

export default PortalBenefitsSection
