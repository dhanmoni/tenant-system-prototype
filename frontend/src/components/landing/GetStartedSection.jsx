import { useMemo, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import AuthPanel from './AuthPanel'
import { easeOutExpo } from '../../utils/landingMotion'
import { useLanguage } from '../../i18n'

const sectionShellVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.14,
			delayChildren: 0.04,
		},
	},
}

/** One transform per column — large fade-up, no nested motion. */
const promoColVariants = {
	hidden: { opacity: 0, y: 80 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 1.05, ease: easeOutExpo },
	},
}

const authColVariants = {
	hidden: { opacity: 0, y: 72 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 1, ease: easeOutExpo },
	},
}

function GetStartedSection({ authPanelProps }) {
	const { t } = useLanguage()
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const inView = useInView(sectionRef, {
		once: true,
		amount: 0.18,
		margin: '0px 0px -6% 0px',
	})
	const animate = Boolean(reduceMotion) || inView

	const scrollToHowToApply = (e) => {
		e.preventDefault()
		document.getElementById('portal-guide')?.scrollIntoView({ behavior: 'smooth' })
	}

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
					<p className="get-started-eyebrow">{t('home.getStarted.eyebrow')}</p>

					<div className="get-started-headline-wrap">
						<h2 id="get-started-heading" className="get-started-headline">
							<span className="get-started-headline__primary">
								{t('home.getStarted.headline1')}
							</span>
							<span className="get-started-headline__accent">
								{t('home.getStarted.headline2')}
							</span>
						</h2>
						<span className="get-started-headline-underline" aria-hidden />
					</div>

					<p className="get-started-promo-lead">{t('home.getStarted.lead')}</p>

					<ul className="get-started-promo-features">
						{promoFeatures.map((item) => (
							<li key={item}>
								<span className="get-started-promo-check-wrap" aria-hidden>
									<Check className="get-started-promo-check" strokeWidth={2.75} />
								</span>
								<span>{item}</span>
							</li>
						))}
					</ul>

					<div className="get-started-promo-actions">
						<a
							href="#portal-guide"
							onClick={scrollToHowToApply}
							className="get-started-promo-link"
						>
							{t('hero.howToApply')}
						</a>
					</div>
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
