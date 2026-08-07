import { useMemo, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import {
	Award,
	ClipboardList,
	Eye,
	Landmark,
	ShieldCheck,
} from 'lucide-react'
import { portalBenefitItems } from '../../data/portalBenefits'
import {
	benefitsIntroVariants,
	benefitsModernCardHover,
	benefitsModernCardTap,
	benefitsModernCardVariants,
	benefitsModernGridVariants,
	benefitsTitleAccentVariants,
	benefitsTitleWordVariants,
	introLeadVariants,
} from '../../utils/landingMotion'
import PortalBenefitsVector from './PortalBenefitsVector'
import { useLanguage } from '../../i18n'

const iconMap = {
	landmark: Landmark,
	clipboardList: ClipboardList,
	shieldCheck: ShieldCheck,
}

const benefitCopyKeys = {
	services: {
		title: 'home.benefits.services.title',
		description: 'home.benefits.services.desc',
	},
	tracking: {
		title: 'home.benefits.tracking.title',
		description: 'home.benefits.tracking.desc',
	},
	records: {
		title: 'home.benefits.records.title',
		description: 'home.benefits.records.desc',
	},
}

const BENEFITS_FLOAT_MOTIFS = [
	{ Icon: ShieldCheck, x: '6%', y: '28%', size: 'lg', delay: '0s', drift: 'a' },
	{ Icon: Eye, x: '12%', y: '72%', size: 'md', delay: '1.1s', drift: 'b' },
	{ Icon: Award, x: '90%', y: '26%', size: 'md', delay: '0.35s', drift: 'b' },
	{ Icon: Landmark, x: '86%', y: '70%', size: 'lg', delay: '1.4s', drift: 'c' },
]

function BenefitsFloatMotifs({ reduceMotion }) {
	return (
		<div className="portal-benefits-float" aria-hidden>
			{BENEFITS_FLOAT_MOTIFS.map(({ Icon, x, y, size, delay, drift }, i) => (
				<span
					key={`${x}-${y}-${i}`}
					className={`portal-benefits-float__item portal-benefits-float__item--${size}${
						reduceMotion ? '' : ` portal-benefits-float__item--drift-${drift}`
					}`}
					style={{ left: x, top: y, animationDelay: delay }}
				>
					<Icon strokeWidth={1.5} aria-hidden />
				</span>
			))}
		</div>
	)
}

function BenefitsAnimatedTitle({ titleId, leadText, accentText, fullTitle, reduceMotion }) {
	const leadWords = leadText.trim().split(/\s+/).filter(Boolean)

	return (
		<motion.h2
			id={titleId}
			className="landing-section-title landing-section-title--playful"
			aria-label={fullTitle}
		>
			{leadWords.map((word) => (
				<motion.span
					key={word}
					className="landing-section-title__word"
					variants={reduceMotion ? undefined : benefitsTitleWordVariants}
				>
					{word}
				</motion.span>
			))}
			<motion.span
				className="landing-section-title__word landing-section-title__word--accent"
				variants={reduceMotion ? undefined : benefitsTitleAccentVariants}
			>
				{accentText}
			</motion.span>
		</motion.h2>
	)
}

function PortalBenefitsSection({ className = '' }) {
	const { t } = useLanguage()
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()

	const inView = useInView(sectionRef, {
		once: true,
		amount: 0.18,
		margin: '0px 0px -6% 0px',
	})
	const reveal = Boolean(reduceMotion) || inView

	const items = useMemo(
		() =>
			portalBenefitItems.map((item) => {
				const keys = benefitCopyKeys[item.id]
				return {
					...item,
					title: keys ? t(keys.title) : item.title,
					description: keys ? t(keys.description) : item.description,
				}
			}),
		[t],
	)

	return (
		<section
			ref={sectionRef}
			id="portal-benefits"
			className={`portal-benefits landing-body landing-wallpaper-bg landing-wallpaper-bg--cream scroll-mt-28 pt-10 sm:pt-12 lg:pt-14 pb-8 sm:pb-10 lg:pb-12${className ? ` ${className}` : ''}`}
			aria-labelledby="portal-benefits-heading"
		>
			<div className="portal-benefits__shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<BenefitsFloatMotifs reduceMotion={reduceMotion} />
				<motion.header
					className="portal-benefits__header landing-section-intro-block landing-section-intro-block--center"
					initial={reduceMotion ? false : 'hidden'}
					animate={reveal ? 'visible' : 'hidden'}
					variants={reduceMotion ? undefined : benefitsIntroVariants}
				>
					<BenefitsAnimatedTitle
						titleId="portal-benefits-heading"
						leadText={t('home.benefits.titleLead')}
						accentText={t('home.benefits.titleAccent')}
						fullTitle={t('home.benefits.title')}
						reduceMotion={reduceMotion}
					/>
					<motion.p
						className="landing-section-lead landing-section-intro-lead portal-benefits__intro-lead"
						variants={reduceMotion ? undefined : introLeadVariants}
					>
						{t('home.benefits.lead')}
					</motion.p>
				</motion.header>

				<div className="portal-benefits__body">
					<motion.aside
						className="portal-benefits__visual"
						aria-hidden
						initial={reduceMotion ? false : { opacity: 0, x: -32, scale: 0.94, rotate: -2 }}
						animate={
							reveal
								? { opacity: 1, x: 0, scale: 1, rotate: 0 }
								: { opacity: 0, x: -32, scale: 0.94, rotate: -2 }
						}
						transition={
							reduceMotion
								? { duration: 0 }
								: { type: 'spring', stiffness: 180, damping: 18, delay: 0.12 }
						}
					>
						<div className="portal-benefits__visual-glow" />
						<div className="portal-benefits__visual-frame">
							<PortalBenefitsVector className="portal-benefits__vector" />
						</div>
					</motion.aside>

					<motion.ul
						className="portal-benefits__grid"
						role="list"
						initial={reduceMotion ? false : 'hidden'}
						animate={reveal ? 'visible' : 'hidden'}
						variants={reduceMotion ? undefined : benefitsModernGridVariants}
					>
						{items.map((item, index) => {
							const Icon = iconMap[item.icon] || Landmark
							const step = String(index + 1).padStart(2, '0')
							return (
								<li key={item.id} className="portal-benefits__grid-item" role="listitem">
									<motion.div
										className="portal-benefits__card-motion"
										custom={index}
										variants={reduceMotion ? undefined : benefitsModernCardVariants}
										whileHover={reduceMotion ? undefined : benefitsModernCardHover}
										whileTap={reduceMotion ? undefined : benefitsModernCardTap}
									>
										<article
											className={`portal-benefits-item portal-benefits-item--${item.id}`}
										>
											<span className="portal-benefits-item__index" aria-hidden>
												{step}
											</span>
											<span className="portal-benefits-item__icon" aria-hidden>
												<Icon
													className="portal-benefits-item__icon-svg"
													strokeWidth={1.75}
												/>
											</span>
											<div className="portal-benefits-item__content">
												<h3 className="portal-benefits-item__title">{item.title}</h3>
												<p className="portal-benefits-item__desc">{item.description}</p>
											</div>
										</article>
									</motion.div>
								</li>
							)
						})}
					</motion.ul>
				</div>
			</div>
		</section>
	)
}

export default PortalBenefitsSection
