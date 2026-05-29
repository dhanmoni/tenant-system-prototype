import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { portalPublicStats } from '../../data/portalPublicStats'

const columnVariants = {
	hidden: { opacity: 0, y: 28 },
	visible: (i) => ({
		opacity: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 320,
			damping: 22,
			delay: i * 0.1,
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
			className="portal-stats-strip__figure"
			initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
			animate={
				reduceMotion || active
					? { opacity: 1, scale: 1 }
					: { opacity: 0, scale: 0.8 }
			}
			transition={{ type: 'spring', stiffness: 380, damping: 20 }}
		>
			{display}
		</motion.span>
	)
}

function PortalStatsBar() {
	const stripRef = useRef(null)
	const isInView = useInView(stripRef, { once: true, margin: '-15%' })
	const reduceMotion = useReducedMotion()

	return (
		<div
			ref={stripRef}
			className="portal-stats-strip landing-body"
			aria-label="Portal statistics"
		>
			<div className="portal-stats-strip__inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{portalPublicStats.map((stat, index) => (
					<motion.div
						key={stat.id}
						className="portal-stats-strip__col"
						custom={index}
						initial={reduceMotion ? false : 'hidden'}
						whileInView={reduceMotion ? undefined : 'visible'}
						viewport={{ once: true, margin: '-40px' }}
						variants={reduceMotion ? undefined : columnVariants}
						whileHover={reduceMotion ? undefined : { y: -3 }}
					>
						<AnimatedFigure stat={stat} active={isInView} />
						<motion.p
							className="portal-stats-strip__desc"
							initial={reduceMotion ? false : { opacity: 0 }}
							whileInView={reduceMotion ? undefined : { opacity: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.45, delay: 0.15 + index * 0.08 }}
						>
							{stat.description}
						</motion.p>
					</motion.div>
				))}
			</div>
		</div>
	)
}

export default PortalStatsBar
