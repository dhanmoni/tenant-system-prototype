import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Building2, CircleCheckBig, FileStack, IdCard } from 'lucide-react'
import { portalPublicStats } from '../../data/portalPublicStats'
import {
	scrollStatIconVariants,
	scrollStatItemVariants,
	scrollStatLabelVariants,
	scrollStatRailVariants,
	scrollStatSectionVariants,
} from '../../utils/landingMotion'
import { useLanguage } from '../../i18n'

const statIcons = {
	fileStack: FileStack,
	idCard: IdCard,
	landmark: Building2,
	circleCheck: CircleCheckBig,
}

const statCopyKeys = {
	applications_submitted: {
		label: 'home.stats.applications',
		description: 'home.stats.applicationsDesc',
	},
	uins_issued: {
		label: 'home.stats.uins',
		description: 'home.stats.uinsDesc',
	},
	service_filings: {
		label: 'home.stats.filings',
		description: 'home.stats.filingsDesc',
	},
	disputes_resolved: {
		label: 'home.stats.disputes',
		description: 'home.stats.disputesDesc',
	},
}

function formatCompact(value) {
	if (value >= 1_000_000) {
		const m = value / 1_000_000
		return `${m % 1 === 0 ? m : m.toFixed(1).replace(/\.0$/, '')}M+`
	}
	if (value >= 10_000) {
		return `${Math.round(value / 1000)}K+`
	}
	if (value >= 1_000) {
		const k = value / 1000
		return `${k % 1 === 0 ? k : k.toFixed(1).replace(/\.0$/, '')}K+`
	}
	return `${value}+`
}

function formatLiveCount(current, target) {
	if (current >= target - 0.5) return formatCompact(target)
	if (target >= 1_000_000) return `${(current / 1_000_000).toFixed(2)}M+`
	if (target >= 10_000) return `${(current / 1000).toFixed(1)}K+`
	if (target >= 1_000) return `${(current / 1000).toFixed(2)}K+`
	return `${Math.round(current)}+`
}

function easeOutQuint(t) {
	return 1 - (1 - t) ** 5
}

function AnimatedFigure({ stat, active }) {
	const reduceMotion = useReducedMotion()
	const finalDisplay = stat.display || formatCompact(stat.value)
	const [display, setDisplay] = useState(reduceMotion ? finalDisplay : '0')

	useEffect(() => {
		if (reduceMotion || !active) {
			setDisplay(finalDisplay)
			return undefined
		}

		const target = stat.value
		const duration = 2600
		const delay = 280
		let frame = 0
		let start = 0

		const tick = (now) => {
			if (!start) start = now
			const progress = Math.min((now - start) / duration, 1)
			const current = target * easeOutQuint(progress)
			setDisplay(formatLiveCount(current, target))
			if (progress < 1) frame = requestAnimationFrame(tick)
		}

		setDisplay(formatLiveCount(0, target))
		const wait = window.setTimeout(() => {
			frame = requestAnimationFrame(tick)
		}, delay)

		return () => {
			window.clearTimeout(wait)
			cancelAnimationFrame(frame)
		}
	}, [active, reduceMotion, finalDisplay, stat.value])

	return (
		<motion.span
			className="portal-stats-card__figure"
			initial={reduceMotion ? false : { opacity: 0, y: 24 }}
			animate={reduceMotion || active ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
			transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
		>
			{display}
		</motion.span>
	)
}

function PortalStatsBar() {
	const { t } = useLanguage()
	const stripRef = useRef(null)
	const isInView = useInView(stripRef, { once: true, amount: 0.2 })
	const reduceMotion = useReducedMotion()
	const reveal = reduceMotion || isInView

	const stats = useMemo(
		() =>
			portalPublicStats.map((stat) => {
				const keys = statCopyKeys[stat.id]
				return {
					...stat,
					label: keys ? t(keys.label) : stat.label,
					description: keys ? t(keys.description) : stat.description,
				}
			}),
		[t],
	)

	return (
		<section
			ref={stripRef}
			id="portal-stats"
			className="portal-stats-card portal-stats-card--lead portal-stats-card--rail scroll-mt-28"
			aria-label={t('home.stats.aria')}
		>
			<motion.div
				className="portal-stats-card__wrap mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
				initial={reduceMotion ? false : 'hidden'}
				animate={reveal ? 'visible' : 'hidden'}
				variants={reduceMotion ? undefined : scrollStatSectionVariants}
			>
				<motion.ul
					className="portal-stats-card__panel"
					role="list"
					initial={reduceMotion ? false : 'hidden'}
					animate={reveal ? 'visible' : 'hidden'}
					variants={reduceMotion ? undefined : scrollStatRailVariants}
				>
					{stats.map((stat) => {
						const Icon = statIcons[stat.icon] || FileStack
						return (
							<motion.li
								key={stat.id}
								className="portal-stats-card__item"
								role="listitem"
								variants={reduceMotion ? undefined : scrollStatItemVariants}
							>
								<motion.span
									className="portal-stats-card__icon"
									aria-hidden
									variants={reduceMotion ? undefined : scrollStatIconVariants}
								>
									<Icon className="portal-stats-card__icon-svg" strokeWidth={1.85} />
								</motion.span>
								<div className="portal-stats-card__body">
									<AnimatedFigure stat={stat} active={reveal} />
									<span className="portal-stats-card__rule" aria-hidden />
									<motion.p
										className="portal-stats-card__label"
										variants={reduceMotion ? undefined : scrollStatLabelVariants}
									>
										{stat.label}
									</motion.p>
									<p className="sr-only">{stat.description}</p>
								</div>
							</motion.li>
						)
					})}
				</motion.ul>
			</motion.div>
		</section>
	)
}

export default PortalStatsBar
