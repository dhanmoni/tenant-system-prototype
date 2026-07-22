import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Building2, CircleCheckBig, FileStack, IdCard } from 'lucide-react'
import { portalPublicStats } from '../../data/portalPublicStats'
import { scrollStatItemVariants, scrollStatRailVariants } from '../../utils/landingMotion'
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

function AnimatedFigure({ stat, active }) {
	const reduceMotion = useReducedMotion()
	const [display, setDisplay] = useState(reduceMotion ? stat.display || formatCompact(stat.value) : '0')

	useEffect(() => {
		if (reduceMotion || !active) {
			setDisplay(stat.display || formatCompact(stat.value))
			return
		}

		const target = stat.value
		const duration = 1400
		const start = performance.now()
		let frame = 0

		const tick = (now) => {
			const progress = Math.min((now - start) / duration, 1)
			const eased = 1 - (1 - progress) ** 3
			setDisplay(formatCompact(Math.round(target * eased)))
			if (progress < 1) frame = requestAnimationFrame(tick)
		}

		setDisplay('0')
		frame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(frame)
	}, [active, reduceMotion, stat.display, stat.value])

	return (
		<motion.span
			className="portal-stats-card__figure"
			initial={reduceMotion ? false : { opacity: 0, scale: 0.86 }}
			animate={reduceMotion || active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.86 }}
			transition={{ type: 'spring', stiffness: 340, damping: 18, delay: 0.12 }}
		>
			{display}
		</motion.span>
	)
}

function PortalStatsBar() {
	const { t } = useLanguage()
	const stripRef = useRef(null)
	const isInView = useInView(stripRef, { once: true, margin: '-14% 0px -10% 0px' })
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
			className="portal-stats-card portal-stats-card--bridge portal-stats-card--rail scroll-mt-28"
			aria-label={t('home.stats.aria')}
		>
			<div className="portal-stats-card__wrap mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
								<span className="portal-stats-card__icon" aria-hidden>
									<Icon className="portal-stats-card__icon-svg" strokeWidth={1.85} />
								</span>
								<div className="portal-stats-card__body">
									<AnimatedFigure stat={stat} active={reveal} />
									<span className="portal-stats-card__rule" aria-hidden />
									<p className="portal-stats-card__label">{stat.label}</p>
									<p className="sr-only">{stat.description}</p>
								</div>
							</motion.li>
						)
					})}
				</motion.ul>
			</div>
		</section>
	)
}

export default PortalStatsBar
