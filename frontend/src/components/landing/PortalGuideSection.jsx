import { useMemo, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import {
	Briefcase,
	ClipboardList,
	Handshake,
	Laptop,
	UserPlus,
	Users,
} from 'lucide-react'
import LandingSectionIntro from './LandingSectionIntro'
import AuthNavLink from './AuthNavLink'
import { useLanguage } from '../../i18n'
import {
	guideAccessVariants,
	guideIntroVariants,
	guideSectionVariants,
	guideStepCopyVariants,
	guideStepNumVariants,
	guideStepsVariants,
	guideStepVariants,
} from '../../utils/landingMotion'

const GUIDE_FLOAT_MOTIFS = [
	{ Icon: Users, x: '5%', y: '12%', size: 'lg', delay: '0s', drift: 'a' },
	{ Icon: UserPlus, x: '12%', y: '48%', size: 'md', delay: '1.2s', drift: 'b' },
	{ Icon: ClipboardList, x: '4%', y: '78%', size: 'sm', delay: '0.5s', drift: 'c' },
	{ Icon: Briefcase, x: '16%', y: '22%', size: 'sm', delay: '2s', drift: 'a' },
	{ Icon: Handshake, x: '90%', y: '16%', size: 'md', delay: '0.4s', drift: 'b' },
	{ Icon: Laptop, x: '94%', y: '46%', size: 'lg', delay: '1.5s', drift: 'c' },
	{ Icon: Users, x: '84%', y: '72%', size: 'sm', delay: '0.9s', drift: 'a' },
	{ Icon: ClipboardList, x: '92%', y: '88%', size: 'md', delay: '2.3s', drift: 'b' },
]

function GuideFloatMotifs({ reduceMotion }) {
	return (
		<div className="portal-guide-float" aria-hidden>
			{GUIDE_FLOAT_MOTIFS.map(({ Icon, x, y, size, delay, drift }, i) => (
				<span
					key={`${x}-${y}-${i}`}
					className={`portal-guide-float__item portal-guide-float__item--${size}${
						reduceMotion ? '' : ` portal-guide-float__item--drift-${drift}`
					}`}
					style={{ left: x, top: y, animationDelay: delay }}
				>
					<Icon strokeWidth={1.5} aria-hidden />
				</span>
			))}
		</div>
	)
}

function PortalGuideSection() {
	const { t } = useLanguage()
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const inView = useInView(sectionRef, {
		once: true,
		amount: 0.22,
		margin: '0px 0px -10% 0px',
	})
	const reveal = Boolean(reduceMotion) || inView

	const steps = useMemo(
		() => [
			{
				num: '1',
				title: t('home.guide.step1.title'),
				text: t('home.guide.step1.text'),
			},
			{
				num: '2',
				title: t('home.guide.step2.title'),
				text: t('home.guide.step2.text'),
			},
			{
				num: '3',
				title: t('home.guide.step3.title'),
				text: t('home.guide.step3.text'),
			},
		],
		[t],
	)

	return (
		<section
			id="portal-guide"
			className="portal-guide-section landing-wallpaper-bg landing-wallpaper-bg--white scroll-mt-28 pt-12 sm:pt-16 lg:pt-24 pb-7 sm:pb-9 lg:pb-12"
			aria-labelledby="portal-guide-heading"
		>
			<div id="how-to-apply" className="scroll-mt-28" tabIndex={-1} aria-hidden />

			<div ref={sectionRef} className="portal-guide-section__inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<GuideFloatMotifs reduceMotion={reduceMotion} />
				<motion.div
					initial={reduceMotion ? false : 'hidden'}
					animate={reveal ? 'visible' : 'hidden'}
					variants={reduceMotion ? undefined : guideSectionVariants}
				>
					<motion.div variants={reduceMotion ? undefined : guideIntroVariants}>
						<LandingSectionIntro
							className="mx-auto max-w-2xl"
							align="center"
							title={t('home.guide.title')}
							lead={t('home.guide.lead')}
							titleId="portal-guide-heading"
							animateWhen={reveal}
						/>
					</motion.div>

					<motion.ol
						className="portal-guide-steps"
						variants={reduceMotion ? undefined : guideStepsVariants}
					>
						{steps.map((step) => (
							<motion.li
								key={step.num}
								className="portal-guide-step"
								variants={reduceMotion ? undefined : guideStepVariants}
							>
								<motion.span
									className="portal-guide-step__num"
									aria-hidden
									variants={reduceMotion ? undefined : guideStepNumVariants}
								>
									{step.num}
								</motion.span>
								<motion.div variants={reduceMotion ? undefined : guideStepCopyVariants}>
									<h3 className="portal-guide-step__title">{step.title}</h3>
									<p className="portal-guide-step__text">{step.text}</p>
								</motion.div>
							</motion.li>
						))}
					</motion.ol>

					<motion.div
						className="portal-guide-cta"
						variants={reduceMotion ? undefined : guideAccessVariants}
					>
						<AuthNavLink mode="register" className="portal-guide-cta__primary">
							{t('home.guide.createAccount')}
						</AuthNavLink>
						<a href="#services" className="portal-guide-cta__secondary">
							{t('home.guide.viewServices')}
						</a>
					</motion.div>
				</motion.div>
			</div>
		</section>
	)
}

export default PortalGuideSection
