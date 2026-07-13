import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Building2, CircleCheckBig, FileStack, IdCard } from 'lucide-react'
import { portalPublicStats } from '../../data/portalPublicStats'
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

const itemVariants = {
	hidden: { opacity: 0, y: 16 },
	visible: (i) => ({
		opacity: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 320,
			damping: 24,
			delay: i * 0.08,
		},
	}),
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
			initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
			animate={
				reduceMotion || active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
			}
			transition={{ type: 'spring', stiffness: 380, damping: 20 }}
		>
			{display}
		</motion.span>
	)
}

function PortalStatsBar() {
	const { t } = useLanguage()
	const stripRef = useRef(null)
	const isInView = useInView(stripRef, { once: true, margin: '-12%' })
	const reduceMotion = useReducedMotion()

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
			className="portal-stats-card portal-stats-card--bridge scroll-mt-28"
			aria-label={t('home.stats.aria')}
		>
			<div className="portal-stats-card__wrap mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					className="portal-stats-card__panel"
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-40px' }}
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				>
					{stats.map((stat, index) => {
						const Icon = statIcons[stat.icon] || FileStack
						return (
							<motion.div
								key={stat.id}
								className="portal-stats-card__item"
								custom={index}
								initial={reduceMotion ? false : 'hidden'}
								whileInView={reduceMotion ? undefined : 'visible'}
								viewport={{ once: true, margin: '-40px' }}
								variants={reduceMotion ? undefined : itemVariants}
							>
								<span className="portal-stats-card__icon" aria-hidden>
									<Icon className="portal-stats-card__icon-svg" strokeWidth={1.5} />
								</span>
								<div className="portal-stats-card__body">
									<AnimatedFigure stat={stat} active={isInView} />
									<p className="portal-stats-card__label">{stat.label}</p>
									<p className="sr-only">{stat.description}</p>
								</div>
							</motion.div>
						)
					})}
				</motion.div>
			</div>
		</section>
	)
}

export default PortalStatsBar
