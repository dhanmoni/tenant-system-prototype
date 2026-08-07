import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import {
	ArrowRight,
	Building2,
	FileCheck,
	FileText,
	Gavel,
	Landmark,
	Stamp,
} from 'lucide-react'
import { portalServiceHighlights } from '../../data/portalServices'
import {
	scrollCtaVariants,
	scrollHeaderVariants,
	scrollSectionVariants,
	SERVICES_LADDER,
	servicesCardHover,
	servicesCardTap,
	servicesCardVariants,
	servicesGridVariants,
	servicesTitleAccentVariants,
	servicesTitleWordVariants,
	introLeadVariants,
} from '../../utils/landingMotion'
import PortalServicesWatermark from './PortalServicesWatermark'
import { useLanguage } from '../../i18n'

const SERVICE_ORDER = ['uin', 'rent-authority', 'rent-court', 'rent-tribunal']

const FLOAT_MOTIFS = [
	{ Icon: FileText, side: 'left', x: '6%', y: '18%', size: 'lg', delay: '0s', drift: 'a' },
	{ Icon: Stamp, side: 'left', x: '12%', y: '72%', size: 'md', delay: '1.1s', drift: 'b' },
	{ Icon: Gavel, side: 'right', x: '90%', y: '16%', size: 'md', delay: '0.35s', drift: 'b' },
	{ Icon: Landmark, side: 'right', x: '86%', y: '68%', size: 'lg', delay: '1.4s', drift: 'c' },
]

function ServicesFloatMotifs({ reduceMotion }) {
	return (
		<div className="portal-services-showcase__float" aria-hidden>
			{FLOAT_MOTIFS.map(({ Icon, x, y, size, delay, drift }, i) => (
				<span
					key={`${x}-${y}-${i}`}
					className={`portal-services-showcase__float-item portal-services-showcase__float-item--${size}${
						reduceMotion ? '' : ` portal-services-showcase__float-item--drift-${drift}`
					}`}
					style={{ left: x, top: y, animationDelay: delay }}
				>
					<Icon strokeWidth={1.5} aria-hidden />
				</span>
			))}
		</div>
	)
}

function ServicesAnimatedTitle({ titleId, leadText, accentText, fullTitle, reduceMotion }) {
	const leadWords = leadText.trim().split(/\s+/).filter(Boolean)

	return (
		<motion.h2
			id={titleId}
			className="landing-section-title landing-section-title--playful"
			aria-label={fullTitle}
		>
			{leadWords.map((word) => (
				<motion.span
					key={word}
					className="landing-section-title__word"
					variants={reduceMotion ? undefined : servicesTitleWordVariants}
				>
					{word}
				</motion.span>
			))}
			<motion.span
				className="landing-section-title__word landing-section-title__word--accent"
				variants={reduceMotion ? undefined : servicesTitleAccentVariants}
			>
				{accentText}
			</motion.span>
		</motion.h2>
	)
}

const FLOW_DESKTOP = {
	viewBox: '0 0 1000 360',
	segments: [
		'M 208 292 C 248 212, 278 198, 312 258',
		'M 458 228 C 498 148, 528 134, 562 194',
		'M 708 152 C 748 72, 778 58, 812 118',
	],
	nodes: [
		[208, 292],
		[312, 258],
		[458, 228],
		[562, 194],
		[708, 152],
		[812, 118],
	],
}

/* 2×2 tablet path: 1→2 across, 2→3 down-left, 3→4 across */
const FLOW_TABLET = {
	viewBox: '0 0 1000 760',
	segments: [
		'M 220 188 C 360 98, 640 98, 780 188',
		'M 780 230 C 690 360, 310 420, 220 550',
		'M 220 592 C 360 502, 640 502, 780 592',
	],
	nodes: [
		[220, 188],
		[780, 188],
		[780, 230],
		[220, 550],
		[220, 592],
		[780, 592],
	],
}

function segmentDelay(i) {
	return SERVICES_LADDER.delayChildren + i * SERVICES_LADDER.stagger + SERVICES_LADDER.segmentLead
}

function nodeDelay(i) {
	if (i === 0) return SERVICES_LADDER.delayChildren
	const seg = Math.floor(i / 2)
	const isEnd = i % 2 === 1
	if (isEnd) return segmentDelay(seg) + SERVICES_LADDER.segmentDuration * 0.85
	return SERVICES_LADDER.delayChildren + seg * SERVICES_LADDER.stagger
}

function ServicesFlowSvg({ flow, className, reveal, reduceMotion, gradientId }) {
	return (
		<svg
			className={className}
			viewBox={flow.viewBox}
			preserveAspectRatio="none"
			aria-hidden
		>
			<defs>
				<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stopColor="var(--color-light-caramel-500)" stopOpacity="0.75" />
					<stop offset="50%" stopColor="var(--landing-accent)" stopOpacity="0.9" />
					<stop offset="100%" stopColor="var(--color-light-caramel-700)" stopOpacity="0.75" />
				</linearGradient>
			</defs>
			{flow.segments.map((d, i) => {
				const delay = segmentDelay(i)
				return (
					<g key={d}>
						<motion.path
							className="portal-services-showcase__flow-path portal-services-showcase__flow-path--soft"
							d={d}
							fill="none"
							stroke={`url(#${gradientId})`}
							strokeWidth="3.25"
							strokeLinecap="round"
							initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
							animate={reveal ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
							transition={
								reduceMotion
									? { duration: 0 }
									: {
											duration: SERVICES_LADDER.segmentDuration,
											ease: [0.22, 1, 0.36, 1],
											delay,
										}
							}
						/>
						<motion.path
							className="portal-services-showcase__flow-path"
							d={d}
							fill="none"
							stroke={`url(#${gradientId})`}
							strokeWidth="1.35"
							strokeLinecap="round"
							strokeDasharray="4 8"
							initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
							animate={
								reveal ? { pathLength: 1, opacity: 0.95 } : { pathLength: 0, opacity: 0 }
							}
							transition={
								reduceMotion
									? { duration: 0 }
									: {
											duration: SERVICES_LADDER.segmentDuration + 0.08,
											ease: [0.22, 1, 0.36, 1],
											delay: delay + 0.04,
										}
							}
						/>
					</g>
				)
			})}
			{flow.nodes.map(([cx, cy], i) => (
				<motion.circle
					key={`${cx}-${cy}`}
					className="portal-services-showcase__flow-node"
					cx={cx}
					cy={cy}
					r={i % 2 === 0 ? 4.75 : 3.75}
					initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
					animate={reveal ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
					transition={
						reduceMotion
							? { duration: 0 }
							: {
									type: 'spring',
									stiffness: 320,
									damping: 18,
									delay: nodeDelay(i),
								}
					}
				/>
			))}
		</svg>
	)
}

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
			className="portal-services-showcase landing-body landing-wallpaper-bg landing-wallpaper-bg--white scroll-mt-28 pt-20 sm:pt-24 lg:pt-28 pb-24 sm:pb-28 lg:pb-32"
			aria-labelledby="services-heading"
		>
			<div className="portal-services-showcase__seam" aria-hidden />
			<div id="tenancy-authorities" className="scroll-mt-28" tabIndex={-1} aria-hidden />

			<div ref={sectionRef} className="portal-services-showcase__inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<ServicesFloatMotifs reduceMotion={reduceMotion} />
				<motion.div
					initial={reduceMotion ? false : 'hidden'}
					animate={reveal ? 'visible' : 'hidden'}
					variants={reduceMotion ? undefined : scrollSectionVariants}
				>
					<motion.div
						className="portal-services-showcase__header landing-section-intro-block landing-section-intro-block--center"
						variants={reduceMotion ? undefined : scrollHeaderVariants}
					>
						<ServicesAnimatedTitle
							titleId="services-heading"
							leadText={t('home.services.titleLead')}
							accentText={t('home.services.titleAccent')}
							fullTitle={t('home.services.title')}
							reduceMotion={reduceMotion}
						/>
						<motion.p
							className="landing-section-lead landing-section-intro-lead portal-services-showcase__intro-lead"
							variants={reduceMotion ? undefined : introLeadVariants}
						>
							{t('home.services.lead')}
						</motion.p>
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

					<div className="portal-services-showcase__stage">
						<ServicesFlowSvg
							flow={FLOW_TABLET}
							className="portal-services-showcase__flow portal-services-showcase__flow--tablet"
							reveal={reveal}
							reduceMotion={reduceMotion}
							gradientId="services-flow-grad-tablet"
						/>
						<ServicesFlowSvg
							flow={FLOW_DESKTOP}
							className="portal-services-showcase__flow portal-services-showcase__flow--desktop"
							reveal={reveal}
							reduceMotion={reduceMotion}
							gradientId="services-flow-grad-desktop"
						/>

						<motion.ul
							className="portal-services-showcase__grid"
							role="list"
							variants={reduceMotion ? undefined : servicesGridVariants}
						>
							{items.map((item, index) => {
								const Icon = highlightIcons[item.id] || FileCheck
								return (
									<li key={item.id} className="portal-services-showcase__grid-item">
										<motion.div
											className="portal-services-showcase__card-motion"
											custom={index}
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
														<ArrowRight
															className="portal-services-showcase-card__more-icon"
															strokeWidth={2.25}
														/>
													</span>
												</div>
											</Link>
										</motion.div>
									</li>
								)
							})}
						</motion.ul>
					</div>
				</motion.div>
			</div>

			<PortalServicesWatermark />
		</section>
	)
}

export default PortalServicesSection
