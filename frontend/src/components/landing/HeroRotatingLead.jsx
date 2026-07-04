import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { heroLeadMessages } from '../../data/heroLeadMessages'

const TYPE_MS = 42
const DELETE_MS = 26
const HOLD_MS = 3200
const ROTATE_MS = 5200

function HeroRotatingLead() {
	const reduceMotion = useReducedMotion()
	const [messageIndex, setMessageIndex] = useState(0)
	const [displayed, setDisplayed] = useState('')
	const [isDeleting, setIsDeleting] = useState(false)

	const currentMessage = heroLeadMessages[messageIndex] ?? heroLeadMessages[0]

	useEffect(() => {
		if (reduceMotion) return undefined

		let timeoutId

		if (!isDeleting && displayed.length < currentMessage.length) {
			timeoutId = window.setTimeout(
				() => setDisplayed(currentMessage.slice(0, displayed.length + 1)),
				TYPE_MS,
			)
		} else if (!isDeleting && displayed.length === currentMessage.length) {
			timeoutId = window.setTimeout(() => setIsDeleting(true), HOLD_MS)
		} else if (isDeleting && displayed.length > 0) {
			timeoutId = window.setTimeout(
				() => setDisplayed(displayed.slice(0, -1)),
				DELETE_MS,
			)
		} else {
			setIsDeleting(false)
			setMessageIndex((prev) => (prev + 1) % heroLeadMessages.length)
		}

		return () => window.clearTimeout(timeoutId)
	}, [currentMessage, displayed, isDeleting, reduceMotion])

	useEffect(() => {
		if (!reduceMotion) return undefined

		const timer = window.setInterval(() => {
			setMessageIndex((prev) => (prev + 1) % heroLeadMessages.length)
		}, ROTATE_MS)

		return () => window.clearInterval(timer)
	}, [reduceMotion])

	if (reduceMotion) {
		return (
			<span className="landing-hero-lead__text" aria-live="polite">
				<AnimatePresence mode="wait" initial={false}>
					<motion.span
						key={messageIndex}
						className="landing-hero-lead__phrase"
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -6 }}
						transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
					>
						{heroLeadMessages[messageIndex]}
					</motion.span>
				</AnimatePresence>
			</span>
		)
	}

	return (
		<span className="landing-hero-lead__text" aria-live="polite">
			<span className="landing-hero-lead__phrase">{displayed}</span>
			<span className="landing-hero-lead__cursor" aria-hidden />
		</span>
	)
}

export default HeroRotatingLead
