import { useMemo, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import AuthPanel from './AuthPanel'
import { easeOutExpo, easePlayful } from '../../utils/landingMotion'
import { useLanguage } from '../../i18n'

const sectionShellVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.16,
			delayChildren: 0.02,
		},
	},
}

/** Left column — orchestrates a clean cascade */
const promoColVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.11,
			delayChildren: 0.05,
		},
	},
}

const promoEyebrowVariants = {
	hidden: { opacity: 0, y: 10, letterSpacing: '0.28em' },
	visible: {
		opacity: 1,
		y: 0,
		letterSpacing: '0.14em',
		transition: { duration: 0.45, ease: easeOutExpo },
	},
}

const promoHeadlineBlockVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.02,
		},
	},
}

const promoTitleLineVariants = {
	hidden: { opacity: 0, y: 36, clipPath: 'inset(0 0 100% 0)' },
	visible: {
		opacity: 1,
		y: 0,
		clipPath: 'inset(0 0 0% 0)',
		transition: {
			duration: 0.62,
			ease: easeOutExpo,
		},
	},
}

const promoUnderlineVariants = {
	hidden: { scaleX: 0, opacity: 0 },
	visible: {
		scaleX: 1,
		opacity: 1,
		transition: {
			duration: 0.55,
			ease: easePlayful,
			delay: 0.04,
		},
	},
}

const promoLeadVariants = {
	hidden: { opacity: 0, y: 18 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.48,
			ease: easeOutExpo,
		},
	},
}

const promoFeaturesListVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.09,
			delayChildren: 0.04,
		},
	},
}

const promoFeatureItemVariants = {
	hidden: { opacity: 0, x: -18, y: 8 },
	visible: {
		opacity: 1,
		x: 0,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 380,
			damping: 26,
			mass: 0.75,
		},
	},
}

const promoCheckVariants = {
	hidden: { opacity: 0, scale: 0.4 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 460,
			damping: 18,
		},
	},
}

const authColVariants = {
	hidden: { opacity: 0, y: 32, scale: 0.975 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.55,
			ease: easeOutExpo,
			delay: 0.1,
		},
	},
}

function GetStartedSection({ authPanelProps }) {
	const { t } = useLanguage()
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const inView = useInView(sectionRef, {
		once: true,
		amount: 0.22,
		margin: '0px 0px -10% 0px',
	})
	const animate = Boolean(reduceMotion) || inView

	const promoFeatures = useMemo(
		() => [
			t('home.getStarted.feature1'),
			t('home.getStarted.feature2'),
			t('home.getStarted.feature3'),
		],
		[t],
	)

	return (
		<section
			id="portal-content"
			ref={sectionRef}
			className="get-started-section get-started-section--modern landing-wallpaper-bg landing-wallpaper-bg--cream scroll-mt-28"
			aria-labelledby="get-started-heading"
		>
			<motion.div
				className="get-started-shell"
				initial={reduceMotion ? false : 'hidden'}
				animate={animate ? 'visible' : 'hidden'}
				variants={reduceMotion ? undefined : sectionShellVariants}
			>
				<motion.div
					className="get-started-promo"
					variants={reduceMotion ? undefined : promoColVariants}
				>
					<motion.p
						className="get-started-eyebrow"
						variants={reduceMotion ? undefined : promoEyebrowVariants}
					>
						{t('home.getStarted.eyebrow')}
					</motion.p>

					<motion.div
						className="get-started-headline-wrap"
						variants={reduceMotion ? undefined : promoHeadlineBlockVariants}
					>
						<h2 id="get-started-heading" className="get-started-headline">
							<motion.span
								className="get-started-headline__primary"
								variants={reduceMotion ? undefined : promoTitleLineVariants}
							>
								{t('home.getStarted.headline1')}
							</motion.span>
							<motion.span
								className="get-started-headline__accent"
								variants={reduceMotion ? undefined : promoTitleLineVariants}
							>
								{t('home.getStarted.headline2')}
							</motion.span>
						</h2>
						<motion.span
							className="get-started-headline-underline"
							variants={reduceMotion ? undefined : promoUnderlineVariants}
							aria-hidden
						/>
					</motion.div>

					<motion.p
						className="get-started-promo-lead"
						variants={reduceMotion ? undefined : promoLeadVariants}
					>
						{t('home.getStarted.lead')}
					</motion.p>

					<motion.ul
						className="get-started-promo-features"
						variants={reduceMotion ? undefined : promoFeaturesListVariants}
					>
						{promoFeatures.map((item) => (
							<motion.li key={item} variants={reduceMotion ? undefined : promoFeatureItemVariants}>
								<motion.span variants={reduceMotion ? undefined : promoCheckVariants}>
									<Check className="get-started-promo-check" aria-hidden strokeWidth={2.5} />
								</motion.span>
								<span>{item}</span>
							</motion.li>
						))}
					</motion.ul>
				</motion.div>

				<motion.div
					className="get-started-auth"
					variants={reduceMotion ? undefined : authColVariants}
				>
					<AuthPanel {...authPanelProps} />
				</motion.div>
			</motion.div>
		</section>
	)
}

export default GetStartedSection
