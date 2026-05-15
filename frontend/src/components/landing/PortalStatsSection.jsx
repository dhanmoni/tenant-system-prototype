import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import {
	FileText,
	Award,
	Users,
	Scale,
	CheckCircle2,
	Clock,
	Building2,
	MapPin,
	TrendingUp,
	TrendingDown,
} from 'lucide-react'
import { portalPublicStats, portalStatsMeta } from '../../data/portalPublicStats'

const iconMap = {
	applications_submitted: FileText,
	certificates_issued: Award,
	citizens_registered: Users,
	disputes_raised: Scale,
	matters_resolved: CheckCircle2,
	pending_review: Clock,
	rent_authority_filings: Building2,
	districts_active: MapPin,
}

function formatStatValue(value) {
	return new Intl.NumberFormat('en-IN').format(value)
}

function StatValue({ value, active }) {
	const reduceMotion = useReducedMotion()
	const [display, setDisplay] = useState(reduceMotion ? value : 0)

	useEffect(() => {
		if (!active || reduceMotion) {
			setDisplay(value)
			return
		}

		const duration = 1400
		const start = performance.now()
		let frame = 0

		const tick = (now) => {
			const progress = Math.min((now - start) / duration, 1)
			const eased = 1 - (1 - progress) ** 3
			setDisplay(Math.round(value * eased))
			if (progress < 1) frame = requestAnimationFrame(tick)
		}

		setDisplay(0)
		frame = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(frame)
	}, [active, reduceMotion, value])

	return <span className="landing-stat-value">{formatStatValue(display)}</span>
}

function StatCard({ stat, index, active }) {
	const Icon = iconMap[stat.id] || FileText
	const TrendIcon = stat.trendUp === false ? TrendingDown : TrendingUp

	return (
		<motion.article
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-40px' }}
			transition={{ duration: 0.4, delay: index * 0.05 }}
			className="landing-stat-card"
		>
			<div className="landing-stat-card-top">
				<span className="landing-stat-icon" aria-hidden>
					<Icon className="h-5 w-5" />
				</span>
				{stat.trend ? (
					<span
						className={`landing-stat-trend ${
							stat.trendUp === true
								? 'landing-stat-trend--up'
								: stat.trendUp === false
									? 'landing-stat-trend--down'
									: 'landing-stat-trend--neutral'
						}`}
					>
						{stat.trendUp !== null ? <TrendIcon className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
						{stat.trend}
					</span>
				) : null}
			</div>
			<StatValue value={stat.value} active={active} />
			<h3 className="landing-stat-label">{stat.label}</h3>
			<p className="landing-stat-hint">{stat.hint}</p>
		</motion.article>
	)
}

function PortalStatsSection() {
	const gridRef = useRef(null)
	const isInView = useInView(gridRef, { once: true, margin: '-80px' })

	return (
		<section
			id="portal-stats"
			className="landing-stats-section bg-white py-12 sm:py-16 lg:py-20"
			aria-labelledby="portal-stats-heading"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="landing-stats-header">
					<div className="max-w-3xl">
						<p className="landing-section-eyebrow">{portalStatsMeta.eyebrow}</p>
						<h2 id="portal-stats-heading" className="landing-section-title">
							{portalStatsMeta.title}
						</h2>
						<p className="landing-section-lead">{portalStatsMeta.lead}</p>
					</div>
					<div className="landing-stats-live" role="status">
						<span className="landing-stats-live-dot" aria-hidden />
						<span className="landing-stats-live-text">{portalStatsMeta.lastUpdatedLabel}</span>
					</div>
				</div>

				<div ref={gridRef} className="landing-stats-grid mt-10 sm:mt-12">
					{portalPublicStats.map((stat, index) => (
						<StatCard key={stat.id} stat={stat} index={index} active={isInView} />
					))}
				</div>

				<p className="landing-stats-demo-note mt-8 text-center text-sm text-slate-500">
					{portalStatsMeta.demoNote}
				</p>
			</div>
		</section>
	)
}

export default PortalStatsSection
