import { Children, cloneElement, isValidElement, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { easeOutExpo, landingInView } from '../../utils/landingMotion'

const fadeUp = {
	hidden: { opacity: 0, y: 28 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.55, ease: easeOutExpo },
	},
}

export function ScrollFadeUp({ children, className = '', delay = 0 }) {
	const ref = useRef(null)
	const reduceMotion = useReducedMotion()
	const inView = useInView(ref, landingInView)
	const show = Boolean(reduceMotion) || inView

	return (
		<motion.div
			ref={ref}
			className={`landing-scroll-fade${className ? ` ${className}` : ''}`}
			initial={reduceMotion ? false : 'hidden'}
			animate={show ? 'visible' : 'hidden'}
			variants={reduceMotion ? undefined : fadeUp}
			transition={reduceMotion ? { duration: 0 } : { delay }}
		>
			{children}
		</motion.div>
	)
}

function fadeItem(child, index) {
	if (!isValidElement(child)) return child
	return (
		<ScrollFadeUp key={child.key ?? index} delay={Math.min(index * 0.04, 0.12)}>
			{child}
		</ScrollFadeUp>
	)
}

/** Wraps each block of a public-page body so it fades up as it enters view. */
export function ScrollFadeContent({ children }) {
	return Children.map(children, (child) => {
		if (!isValidElement(child)) return child
		const className = String(child.props.className || '')

		if (className.includes('gov-plain-page')) {
			return cloneElement(child, {
				children: Children.map(child.props.children, fadeItem),
			})
		}

		if (className.includes('gov-services-doc')) {
			return cloneElement(child, {
				children: Children.map(child.props.children, (inner) => {
					if (!isValidElement(inner)) return inner
					const innerClass = String(inner.props.className || '')
					if (innerClass.includes('gov-services-doc__main')) {
						return cloneElement(inner, {
							children: Children.map(inner.props.children, fadeItem),
						})
					}
					return inner
				}),
			})
		}

		return fadeItem(child, 0)
	})
}
