import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Activity, FileCheck, Layers, Smartphone } from 'lucide-react'
import { portalBenefitCards, portalBenefitsIntro } from '../../data/portalBenefits'
import benefitsImage from '../../assets/img/img3.png'

const easeOut = [0.22, 1, 0.36, 1]

const iconMap = {
	layers: Layers,
	file: FileCheck,
	activity: Activity,
	smartphone: Smartphone,
}

const introItemVariants = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.45, ease: easeOut },
	},
}

const cardVariants = {
	hidden: { opacity: 0, y: 24, scale: 0.96 },
	visible: (i) => ({
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { duration: 0.5, ease: easeOut, delay: i * 0.1 },
	}),
}

function PortalBenefitsSection() {
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const inView = useInView(sectionRef, { once: true, margin: '-10% 0px -8% 0px' })
	const animate = reduceMotion || inView

	return (
		<section
			ref={sectionRef}
			id="portal-benefits"
			className="portal-benefits landing-body landing-wallpaper-bg landing-wallpaper-bg--cream py-14 sm:py-16 lg:py-20"
			aria-labelledby="portal-benefits-heading"
		>
			<div className="portal-benefits__inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					className="portal-benefits__intro"
					initial={reduceMotion ? false : 'hidden'}
					animate={animate ? 'visible' : 'hidden'}
					variants={{
						hidden: {},
						visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
					}}
				>
					<motion.p className="landing-section-eyebrow" variants={reduceMotion ? undefined : introItemVariants}>
						{portalBenefitsIntro.eyebrow}
					</motion.p>
					<motion.h2
						id="portal-benefits-heading"
						className="landing-section-title"
						variants={reduceMotion ? undefined : introItemVariants}
					>
						{portalBenefitsIntro.title}
					</motion.h2>
					<motion.p className="landing-section-lead" variants={reduceMotion ? undefined : introItemVariants}>
						{portalBenefitsIntro.lead}
					</motion.p>
				</motion.div>

				<div className="portal-benefits__body">
					<motion.div
						className="portal-benefits__cards"
						initial={reduceMotion ? false : { opacity: 0, x: -24 }}
						animate={animate ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
						transition={{ duration: 0.55, ease: easeOut, delay: 0.12 }}
					>
						<motion.div
							className="portal-benefits__cards-grid"
							initial={reduceMotion ? false : 'hidden'}
							animate={animate ? 'visible' : 'hidden'}
							variants={{
								hidden: {},
								visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
							}}
						>
							{portalBenefitCards.map((card, index) => {
								const Icon = iconMap[card.icon] || Layers
								return (
									<motion.article
										key={card.id}
										className="portal-benefits-card"
										custom={index}
										variants={reduceMotion ? undefined : cardVariants}
										whileHover={
											reduceMotion
												? undefined
												: {
														y: -6,
														scale: 1.02,
														transition: { duration: 0.22, ease: easeOut },
													}
										}
									>
										<motion.span
											className="portal-benefits-card__icon"
											aria-hidden
											whileHover={reduceMotion ? undefined : { scale: 1.08 }}
											transition={{ duration: 0.2 }}
										>
											<Icon className="h-5 w-5" strokeWidth={1.85} />
										</motion.span>
										<h3 className="portal-benefits-card__title">{card.title}</h3>
										<ul className="portal-benefits-card__tags">
											{card.tags.map((tag) => (
												<li key={tag}>
													<span className="portal-benefits-card__pill">{tag}</span>
												</li>
											))}
										</ul>
									</motion.article>
								)
							})}
						</motion.div>
					</motion.div>

					<motion.div
						className="portal-benefits__media"
						initial={reduceMotion ? false : { opacity: 0, x: 28, scale: 0.98 }}
						animate={animate ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 28, scale: 0.98 }}
						transition={{ duration: 0.55, ease: easeOut, delay: 0.18 }}
					>
						<motion.div
							className="portal-benefits__media-blob"
							aria-hidden
							animate={
								reduceMotion || !animate
									? undefined
									: { scale: [1, 1.04, 1], opacity: [0.75, 0.85, 0.75] }
							}
							transition={
								reduceMotion
									? undefined
									: { duration: 7, repeat: Infinity, ease: 'easeInOut' }
							}
						/>
						<div className="portal-benefits__media-frame">
							<img
								src={benefitsImage}
								alt="Official presenting tenancy registration and certificate services to citizens"
								className="portal-benefits__media-img"
								loading="lazy"
								decoding="async"
							/>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	)
}

export default PortalBenefitsSection
