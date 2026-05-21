import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight, Building2, FileCheck, Gavel, Landmark } from 'lucide-react'
import { portalServiceHighlights, portalServicesIntro } from '../../data/portalServices'

const easeOut = [0.22, 1, 0.36, 1]

const MotionLink = motion.create(Link)

function highlightHref(itemId) {
	return `/services#${itemId === 'uin' ? 'uin-registration' : itemId}`
}

const highlightIcons = {
	uin: FileCheck,
	'rent-authority': Building2,
	'rent-court': Gavel,
	'rent-tribunal': Landmark,
}

const cardVariants = {
	hidden: { opacity: 0, y: 32, scale: 0.94, rotate: -1.5 },
	visible: (i) => ({
		opacity: 1,
		y: 0,
		scale: 1,
		rotate: 0,
		transition: { duration: 0.5, ease: easeOut, delay: i * 0.1 },
	}),
}

const promoItemVariants = {
	hidden: { opacity: 0, x: 20 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.45, ease: easeOut },
	},
}

function PortalServicesSection() {
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const sectionInView = useInView(sectionRef, { once: true, margin: '-10% 0px -8% 0px' })
	const animate = reduceMotion || sectionInView

	const uinHighlight = portalServiceHighlights.find((item) => item.id === 'uin')
	const authorityHighlights = portalServiceHighlights.filter((item) => item.id !== 'uin')
	// Left column top → bottom: highest authority, then first level; right: second level, then UIN.
	const columns = [
		[authorityHighlights[0], authorityHighlights[2]].filter(Boolean),
		[authorityHighlights[1], uinHighlight].filter(Boolean),
	]

	return (
		<section
			ref={sectionRef}
			id="services"
			className="portal-services-showcase landing-body landing-wallpaper-bg landing-wallpaper-bg--white py-14 sm:py-16 lg:py-20"
			aria-labelledby="services-heading"
		>
			<div id="tenancy-authorities" className="scroll-mt-28" tabIndex={-1} aria-hidden />

			<div className="portal-services-showcase__inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="portal-services-showcase__layout">
					<motion.div
						className="portal-services-showcase__visual"
						initial={reduceMotion ? false : { opacity: 0, x: -32 }}
						animate={animate ? { opacity: 1, x: 0 } : { opacity: 0, x: -32 }}
						transition={{ duration: 0.55, ease: easeOut }}
					>
						<motion.div
							className="portal-services-showcase__blob portal-services-showcase__blob--animate"
							aria-hidden
							animate={
								reduceMotion || !animate
									? undefined
									: { scale: [1, 1.03, 1], rotate: [0, 2, 0] }
							}
							transition={
								reduceMotion
									? undefined
									: { duration: 8, repeat: Infinity, ease: 'easeInOut' }
							}
						/>
						<motion.div
							className="portal-services-showcase__cards"
							initial={reduceMotion ? false : 'hidden'}
							animate={animate ? 'visible' : 'hidden'}
							variants={{
								hidden: {},
								visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
							}}
						>
							{columns.map((columnItems, colIndex) => (
								<motion.div
									key={colIndex === 0 ? 'left' : 'right'}
									className={`portal-services-showcase__col${colIndex === 1 ? ' portal-services-showcase__col--offset portal-services-showcase__col--float' : ''}`}
									role="list"
									animate={
										reduceMotion || !animate || colIndex === 0
											? undefined
											: { y: [0, 10, 0] }
									}
									transition={
										reduceMotion
											? undefined
											: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }
									}
								>
									{columnItems.map((item, rowIndex) => {
										const index = colIndex + rowIndex * 2
										const Icon = highlightIcons[item.id] || FileCheck
										const label = `${item.title}: ${item.description}`
										return (
											<MotionLink
												key={item.id}
												to={highlightHref(item.id)}
												role="listitem"
												className={`portal-services-showcase-card portal-services-showcase-card--link ${item.accent}`}
												custom={index}
												variants={reduceMotion ? undefined : cardVariants}
												initial={reduceMotion ? false : 'hidden'}
												animate={animate ? 'visible' : 'hidden'}
												whileHover={
													reduceMotion
														? undefined
														: {
																y: -8,
																scale: 1.02,
																transition: { duration: 0.22, ease: easeOut },
															}
												}
												whileTap={reduceMotion ? undefined : { scale: 0.98 }}
												aria-label={label}
											>
												<motion.span
													className="portal-services-showcase-card__icon"
													aria-hidden
													whileHover={
														reduceMotion ? undefined : { scale: 1.08, rotate: 4 }
													}
													transition={{ duration: 0.2 }}
												>
													<Icon className="portal-services-showcase-card__icon-svg" strokeWidth={1.65} />
												</motion.span>
												<p className="portal-services-showcase-card__tag">{item.tagline}</p>
												<p className="portal-services-showcase-card__title">
													{item.id === 'uin' ? item.shortLabel : item.title}
												</p>
											</MotionLink>
										)
									})}
								</motion.div>
							))}
						</motion.div>
					</motion.div>

					<motion.div
						className="portal-services-showcase__copy portal-services-showcase__copy--promo"
						initial={reduceMotion ? false : 'hidden'}
						animate={animate ? 'visible' : 'hidden'}
						variants={{
							hidden: {},
							visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
						}}
					>
						<motion.h2
							id="services-heading"
							className="landing-section-title portal-services-showcase__promo-title"
							variants={reduceMotion ? undefined : promoItemVariants}
						>
							{portalServicesIntro.title}
						</motion.h2>
						<motion.p
							className="portal-services-showcase__promo-lead"
							variants={reduceMotion ? undefined : promoItemVariants}
						>
							{portalServicesIntro.lead}
						</motion.p>
						<motion.div variants={reduceMotion ? undefined : promoItemVariants}>
							<Link to="/services" className="portal-services-showcase__cta portal-services-showcase__cta--promo">
								Explore all services
								<motion.span
									className="portal-services-showcase__cta-icon"
									aria-hidden
									animate={reduceMotion || !animate ? undefined : { x: [0, 4, 0] }}
									transition={
										reduceMotion
											? undefined
											: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
									}
								>
									<ArrowRight className="h-4 w-4" strokeWidth={2.25} />
								</motion.span>
							</Link>
						</motion.div>
					</motion.div>
				</div>
			</div>
		</section>
	)
}

export default PortalServicesSection
