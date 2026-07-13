import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '../../i18n'

const TYPE_MS = 42
const DELETE_MS = 26
const HOLD_MS = 3200
const ROTATE_MS = 5200

const LEAD_KEYS = ['hero.lead1', 'hero.lead2', 'hero.lead3', 'hero.lead4', 'hero.lead5']

function HeroRotatingLead() {
	const { t, language } = useLanguage()
	const reduceMotion = useReducedMotion()
	const [messageIndex, setMessageIndex] = useState(0)
	const [displayed, setDisplayed] = useState('')
	const [isDeleting, setIsDeleting] = useState(false)

	const heroLeadMessages = useMemo(() => LEAD_KEYS.map((key) => t(key)), [t])

	const currentMessage = heroLeadMessages[messageIndex] ?? heroLeadMessages[0]

	useEffect(() => {
		setMessageIndex(0)
		setDisplayed('')
		setIsDeleting(false)
	}, [language])

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
	}, [currentMessage, displayed, isDeleting, reduceMotion, heroLeadMessages.length])

	useEffect(() => {
		if (!reduceMotion) return undefined

		const timer = window.setInterval(() => {
			setMessageIndex((prev) => (prev + 1) % heroLeadMessages.length)
		}, ROTATE_MS)

		return () => window.clearInterval(timer)
	}, [reduceMotion, heroLeadMessages.length])

	if (reduceMotion) {
		return (
			<span className="landing-hero-lead__text" aria-live="polite">
				<AnimatePresence mode="wait" initial={false}>
					<motion.span
						key={`${language}-${messageIndex}`}
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
