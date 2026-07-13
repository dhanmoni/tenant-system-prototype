import { useMemo, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import AuthPanel from './AuthPanel'
import {
	introContainerVariants,
	introEyebrowVariants,
	introLeadVariants,
	introLineVariants,
	introTitleVariants,
} from '../../utils/landingMotion'
import { useLanguage } from '../../i18n'

const featureVariants = {
	hidden: { opacity: 0, x: -14, scale: 0.98 },
	visible: (i) => ({
		opacity: 1,
		x: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 320,
			damping: 22,
			delay: 0.35 + i * 0.08,
		},
	}),
}

function GetStartedSection({ authPanelProps }) {
	const { t } = useLanguage()
	const promoRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const promoInView = useInView(promoRef, { once: true, margin: '-10% 0px -8% 0px' })
	const animate = reduceMotion || promoInView

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
			className="get-started-section get-started-section--modern scroll-mt-28"
			aria-labelledby="get-started-heading"
		>
			<div className="get-started-shell">
				<motion.div
					ref={promoRef}
					className="get-started-promo"
					initial={reduceMotion ? false : 'hidden'}
					animate={animate ? 'visible' : 'hidden'}
					variants={reduceMotion ? undefined : introContainerVariants}
				>
					<motion.p
						className="get-started-eyebrow"
						variants={reduceMotion ? undefined : introEyebrowVariants}
					>
						{t('home.getStarted.eyebrow')}
					</motion.p>
					<div className="get-started-headline-wrap">
						<motion.h2
							id="get-started-heading"
							className="get-started-headline"
							variants={reduceMotion ? undefined : introContainerVariants}
						>
							<motion.span
								className="get-started-headline__primary"
								variants={reduceMotion ? undefined : introTitleVariants}
							>
								{t('home.getStarted.headline1')}
							</motion.span>
							<motion.span
								className="get-started-headline__accent"
								variants={reduceMotion ? undefined : introTitleVariants}
							>
								{t('home.getStarted.headline2')}
							</motion.span>
						</motion.h2>
						<motion.span
							className="get-started-headline-underline"
							variants={reduceMotion ? undefined : introLineVariants}
							aria-hidden
						/>
					</div>
					<motion.p
						className="get-started-promo-lead"
						variants={reduceMotion ? undefined : introLeadVariants}
					>
						{t('home.getStarted.lead')}
					</motion.p>
					<ul className="get-started-promo-features">
						{promoFeatures.map((item, index) => (
							<motion.li
								key={item}
								custom={index}
								variants={reduceMotion ? undefined : featureVariants}
							>
								<Check className="get-started-promo-check" aria-hidden strokeWidth={2.5} />
								<span>{item}</span>
							</motion.li>
						))}
					</ul>
				</motion.div>

				<div className="get-started-auth">
					<AuthPanel {...authPanelProps} />
				</div>
			</div>
		</section>
	)
}

export default GetStartedSection
