import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import {
	introContainerVariants,
	introEyebrowVariants,
	introLeadVariants,
	introTitleVariants,
} from '../../utils/landingMotion'

function LandingSectionIntro({
	eyebrow,
	title,
	lead,
	align = 'left',
	titleId,
	className = '',
}) {
	const ref = useRef(null)
	const reduceMotion = useReducedMotion()
	const inView = useInView(ref, { once: true, margin: '-8% 0px -10% 0px' })
	const animate = reduceMotion || inView

	return (
		<motion.header
			ref={ref}
			className={`landing-section-intro-block landing-section-intro-block--${align}${className ? ` ${className}` : ''}`}
			initial={reduceMotion ? false : 'hidden'}
			animate={animate ? 'visible' : 'hidden'}
			variants={reduceMotion ? undefined : introContainerVariants}
		>
			{eyebrow ? (
				<motion.p
					className="landing-section-eyebrow landing-section-intro-eyebrow"
					variants={reduceMotion ? undefined : introEyebrowVariants}
				>
					{eyebrow}
				</motion.p>
			) : null}

			<motion.h2
				id={titleId}
				className="landing-section-title"
				variants={reduceMotion ? undefined : introTitleVariants}
			>
				{title}
			</motion.h2>

			{lead ? (
				<motion.p
					className="landing-section-lead landing-section-intro-lead"
					variants={reduceMotion ? undefined : introLeadVariants}
				>
					{lead}
				</motion.p>
			) : null}
		</motion.header>
	)
}

export default LandingSectionIntro
