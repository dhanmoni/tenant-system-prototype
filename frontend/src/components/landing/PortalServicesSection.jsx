import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight, Building2, FileCheck, Gavel, Landmark } from 'lucide-react'
import { portalServiceHighlights } from '../../data/portalServices'
import {
	showcaseCardFromLeftVariants,
	showcaseCardFromRightVariants,
	showcaseCardHover,
	showcaseColumnVariants,
	showcaseGridVariants,
} from '../../utils/landingMotion'
import LandingSectionIntro from './LandingSectionIntro'
import { useLanguage } from '../../i18n'

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
	const visualRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const cardsInView = useInView(visualRef, { once: true, margin: '-14% 0px -10% 0px' })
	const reveal = reduceMotion || cardsInView

	const localizedHighlights = useMemo(
		() =>
			portalServiceHighlights.map((item) => {
				const keys = highlightCopyKeys[item.id]
				if (!keys) return item
				return {
					...item,
					title: t(keys.title),
					shortLabel: t(keys.short),
					tagline: t(keys.tagline),
					description: t(keys.desc),
				}
			}),
		[t],
	)

	const uinHighlight = localizedHighlights.find((item) => item.id === 'uin')
	const authorityHighlights = localizedHighlights.filter((item) => item.id !== 'uin')
	const columns = [
		[authorityHighlights[0], authorityHighlights[2]].filter(Boolean),
		[authorityHighlights[1], uinHighlight].filter(Boolean),
	]

	return (
		<section
			id="services"
			className="portal-services-showcase landing-body landing-wallpaper-bg landing-wallpaper-bg--white scroll-mt-28 py-14 sm:py-16 lg:py-20"
			aria-labelledby="services-heading"
		>
			<div id="tenancy-authorities" className="scroll-mt-28" tabIndex={-1} aria-hidden />

			<div className="portal-services-showcase__inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="portal-services-showcase__layout">
					<div ref={visualRef} className="portal-services-showcase__visual">
						<motion.div
							className="portal-services-showcase__blob portal-services-showcase__blob--animate"
							aria-hidden
							initial={reduceMotion ? false : { opacity: 0, scale: 0.82 }}
							animate={
								reduceMotion
									? undefined
									: reveal
										? {
												opacity: 1,
												scale: [1, 1.045, 1],
												rotate: [0, 2, 0],
											}
										: { opacity: 0, scale: 0.82 }
							}
							transition={
								reduceMotion
									? undefined
									: reveal
										? {
												opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
												scale: {
													duration: 10,
													repeat: Infinity,
													ease: 'easeInOut',
													delay: 0.5,
												},
												rotate: {
													duration: 14,
													repeat: Infinity,
													ease: 'easeInOut',
													delay: 0.5,
												},
											}
										: { duration: 0.4 }
							}
						/>
						<motion.div
							className="portal-services-showcase__cards"
							initial={reduceMotion ? false : 'hidden'}
							animate={reveal ? 'visible' : 'hidden'}
							variants={reduceMotion ? undefined : showcaseGridVariants}
						>
							{columns.map((columnItems, colIndex) => (
								<motion.div
									key={colIndex === 0 ? 'left' : 'right'}
									className={`portal-services-showcase__col${colIndex === 1 ? ' portal-services-showcase__col--offset portal-services-showcase__col--float' : ''}`}
									role="list"
									variants={reduceMotion ? undefined : showcaseColumnVariants}
									animate={
										reveal && colIndex === 1 && !reduceMotion
											? { y: [0, 12, 0] }
											: undefined
									}
									transition={
										reduceMotion
											? undefined
											: {
													y: {
														duration: 7,
														repeat: Infinity,
														ease: 'easeInOut',
														delay: 1.1,
													},
												}
									}
								>
									{columnItems.map((item, rowIndex) => {
										const Icon = highlightIcons[item.id] || FileCheck
										const label = `${item.title}: ${item.description}`
										const cardVariants =
											colIndex === 0 ? showcaseCardFromLeftVariants : showcaseCardFromRightVariants
										const staggerIndex = rowIndex + (item.id === 'uin' ? 0.35 : 0)

										return (
											<MotionLink
												key={item.id}
												to={highlightHref(item.id)}
												role="listitem"
												className={`portal-services-showcase-card portal-services-showcase-card--link portal-services-showcase-card--motion${item.id === 'uin' ? ' portal-services-showcase-card--uin-tile' : ''} ${item.accent}`}
												custom={staggerIndex}
												variants={reduceMotion ? undefined : cardVariants}
												whileHover={reduceMotion ? undefined : showcaseCardHover}
												whileTap={reduceMotion ? undefined : { scale: 0.97 }}
												aria-label={label}
											>
												<motion.span
													className="portal-services-showcase-card__icon"
													aria-hidden
													whileHover={
														reduceMotion
															? undefined
															: {
																	scale: 1.12,
																	rotate: 6,
																	transition: {
																		type: 'spring',
																		stiffness: 480,
																		damping: 14,
																	},
																}
													}
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
					</div>

					<div className="portal-services-showcase__copy portal-services-showcase__copy--promo">
						<LandingSectionIntro
							className="portal-services-showcase__promo-intro"
							title={t('home.services.title')}
							lead={t('home.services.lead')}
							titleId="services-heading"
						/>
						<motion.div
							className="portal-services-showcase__cta-wrap"
							initial={reduceMotion ? false : { opacity: 0, x: 28, y: 14 }}
							whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
							viewport={{ once: true, margin: '-8% 0px -10% 0px' }}
							transition={{
								type: 'spring',
								stiffness: 300,
								damping: 24,
								delay: 0.32,
							}}
						>
							<MotionLink
								to="/services"
								className="portal-services-showcase__cta portal-services-showcase__cta--promo"
								whileHover={
									reduceMotion
										? undefined
										: {
												x: 2,
												transition: { type: 'spring', stiffness: 400, damping: 22 },
											}
								}
							>
								{t('home.services.explore')}
								<motion.span
									className="portal-services-showcase__cta-icon"
									aria-hidden
									animate={reduceMotion ? undefined : { x: [0, 5, 0] }}
									transition={
										reduceMotion
											? undefined
											: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }
									}
								>
									<ArrowRight className="h-4 w-4" strokeWidth={2.25} />
								</motion.span>
							</MotionLink>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default PortalServicesSection
