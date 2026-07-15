import { useMemo, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import {
	Building2,
	ClipboardList,
	FileCheck2,
	Landmark,
	ShieldCheck,
} from 'lucide-react'
import { portalBenefitItems } from '../../data/portalBenefits'
import {
	benefitsBodyVariants,
	benefitsIntroWrapVariants,
	benefitsItemContentVariants,
	benefitsItemDividerVariants,
	benefitsItemHover,
	benefitsItemIconHover,
	benefitsItemIconVariants,
	benefitsItemRowVariants,
	benefitsItemVariants,
	benefitsListRuleVariants,
	benefitsListVariants,
	benefitsMediaVariants,
	benefitsOrbitVariants,
	benefitsSectionVariants,
	benefitsSymbolVariants,
	benefitsSymbolsRingVariants,
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

const orbitSymbols = [
	{ id: 'center', className: 'portal-benefits__symbol--center', Icon: Building2, strokeWidth: 1.5 },
	{ id: 'services', className: 'portal-benefits__symbol--services', Icon: Landmark, strokeWidth: 1.6 },
	{ id: 'tracking', className: 'portal-benefits__symbol--tracking', Icon: ClipboardList, strokeWidth: 1.6 },
	{ id: 'records', className: 'portal-benefits__symbol--records', Icon: ShieldCheck, strokeWidth: 1.6 },
	{ id: 'docs', className: 'portal-benefits__symbol--docs', Icon: FileCheck2, strokeWidth: 1.6 },
]

function PortalBenefitsSection({ className = '' }) {
	const { t } = useLanguage()
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const sectionInView = useInView(sectionRef, { once: true, margin: '-12% 0px -10% 0px' })
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
			className={`portal-benefits landing-body landing-wallpaper-bg landing-wallpaper-bg--cream scroll-mt-28 py-14 sm:py-16 lg:py-20${className ? ` ${className}` : ''}${reveal && !reduceMotion ? ' is-animated' : ''}`}
			aria-labelledby="portal-benefits-heading"
		>
			<div className="portal-benefits__shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					className="portal-benefits__inner"
					initial={reduceMotion ? false : 'hidden'}
					animate={reveal ? 'visible' : 'hidden'}
					variants={reduceMotion ? undefined : benefitsSectionVariants}
				>
					<motion.div
						className="portal-benefits__intro-wrap"
						variants={reduceMotion ? undefined : benefitsIntroWrapVariants}
					>
						<LandingSectionIntro
							className="portal-benefits__intro"
							align="center"
							title={t('home.benefits.title')}
							lead={t('home.benefits.lead')}
							titleId="portal-benefits-heading"
						/>
					</motion.div>

					<motion.div
						className="portal-benefits__body"
						variants={reduceMotion ? undefined : benefitsBodyVariants}
					>
						<motion.div
							className="portal-benefits__list-wrap"
							variants={reduceMotion ? undefined : benefitsListVariants}
						>
							<motion.div
								className="portal-benefits__list-rule"
								aria-hidden
								variants={reduceMotion ? undefined : benefitsListRuleVariants}
							/>

							<ul className="portal-benefits__list">
								{items.map((item, index) => {
									const Icon = iconMap[item.icon] || Landmark
									return (
										<motion.li
											key={item.id}
											className={`portal-benefits-item portal-benefits-item--${item.id}`}
											custom={index}
											variants={reduceMotion ? undefined : benefitsItemVariants}
											whileHover={reduceMotion ? undefined : benefitsItemHover}
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
													whileHover={reduceMotion ? undefined : benefitsItemIconHover}
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

						<motion.div
							className="portal-benefits__media"
							variants={reduceMotion ? undefined : benefitsMediaVariants}
							aria-hidden
						>
							<div className="portal-benefits__symbols">
								<motion.span
									className="portal-benefits__symbols-ring-host"
									variants={reduceMotion ? undefined : benefitsSymbolsRingVariants}
								>
									<span className="portal-benefits__symbols-ring" />
								</motion.span>
								<motion.span
									className="portal-benefits__symbols-ring-host portal-benefits__symbols-ring-host--inner"
									variants={reduceMotion ? undefined : benefitsSymbolsRingVariants}
								>
									<span className="portal-benefits__symbols-ring portal-benefits__symbols-ring--inner" />
								</motion.span>

								{orbitSymbols
									.filter((symbol) => symbol.id === 'center')
									.map((symbol) => {
										const SymbolIcon = symbol.Icon
										return (
											<motion.span
												key={symbol.id}
												className={`portal-benefits__symbol ${symbol.className}`}
												custom={0}
												variants={reduceMotion ? undefined : benefitsSymbolVariants}
											>
												<SymbolIcon strokeWidth={symbol.strokeWidth} />
											</motion.span>
										)
									})}

								<motion.div
									className="portal-benefits__orbit"
									variants={reduceMotion ? undefined : benefitsOrbitVariants}
								>
									{orbitSymbols
										.filter((symbol) => symbol.id !== 'center')
										.map((symbol, index) => {
											const SymbolIcon = symbol.Icon
											return (
												<span
													key={symbol.id}
													className={`portal-benefits__orbit-slot portal-benefits__orbit-slot--${symbol.id}`}
												>
													<span className="portal-benefits__orbit-push">
														<span className="portal-benefits__orbit-face">
															<span className="portal-benefits__orbit-hold">
																<motion.span
																	className={`portal-benefits__symbol ${symbol.className}`}
																	custom={index + 1}
																	variants={
																		reduceMotion ? undefined : benefitsSymbolVariants
																	}
																>
																	<SymbolIcon strokeWidth={symbol.strokeWidth} />
																</motion.span>
															</span>
														</span>
													</span>
												</span>
											)
										})}
								</motion.div>
							</div>
						</motion.div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	)
}

export default PortalBenefitsSection
