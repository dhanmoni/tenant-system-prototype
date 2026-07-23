import { useId, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import LandingSectionIntro from './LandingSectionIntro'
import PortalFaqVector from './PortalFaqVector'
import { useLanguage } from '../../i18n'
import {
	faqIntroVariants,
	faqItemVariants,
	faqListVariants,
	faqSectionVariants,
} from '../../utils/landingMotion'

function FaqItem({ item, isOpen, onToggle, reduceMotion }) {
	const baseId = useId()
	const buttonId = `${baseId}-button`
	const panelId = `${baseId}-panel`

	return (
		<div className={`landing-faq__item${isOpen ? ' is-open' : ''}`}>
			<h3 className="m-0">
				<button
					type="button"
					id={buttonId}
					className={`landing-faq__trigger${isOpen ? ' is-open' : ''}`}
					aria-expanded={isOpen}
					aria-controls={panelId}
					onClick={onToggle}
				>
					<span className="landing-faq__question">{item.question}</span>
					<ChevronDown
						className={`landing-faq__chevron shrink-0${isOpen ? ' is-open' : ''}`}
						size={20}
						strokeWidth={2.25}
						aria-hidden
					/>
				</button>
			</h3>
			<motion.div
				id={panelId}
				role="region"
				aria-labelledby={buttonId}
				aria-hidden={!isOpen}
				className={`landing-faq__panel${isOpen ? ' is-open' : ''}`}
				initial={false}
				animate={{ height: isOpen ? 'auto' : 0 }}
				transition={
					reduceMotion
						? { duration: 0 }
						: { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
				}
			>
				<div className="landing-faq__panel-inner">
					<p className="landing-faq__answer">{item.answer}</p>
				</div>
			</motion.div>
		</div>
	)
}

function PortalFaqSection() {
	const { t } = useLanguage()
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const inView = useInView(sectionRef, {
		once: true,
		amount: 0.28,
		margin: '0px 0px -10% 0px',
	})
	const reveal = Boolean(reduceMotion) || inView

	const faqItems = useMemo(
		() => [
			{
				id: 'what-is-uin',
				question: t('home.faq.uin.q'),
				answer: t('home.faq.uin.a'),
			},
			{
				id: 'documents-required',
				question: t('home.faq.docs.q'),
				answer: t('home.faq.docs.a'),
			},
			{
				id: 'individual-joint',
				question: t('home.faq.joint.q'),
				answer: t('home.faq.joint.a'),
			},
			{
				id: 'track-status',
				question: t('home.faq.track.q'),
				answer: t('home.faq.track.a'),
			},
		],
		[t],
	)

	const [openFaqId, setOpenFaqId] = useState(null)

	const toggleFaq = (id) => {
		setOpenFaqId((prev) => (prev === id ? null : id))
	}

	return (
		<section
			id="portal-faq"
			className="landing-faq-section landing-wallpaper-bg landing-wallpaper-bg--cream scroll-mt-28 pt-14 sm:pt-16 lg:pt-20 pb-8 sm:pb-10 lg:pb-12"
			aria-labelledby="portal-faq-heading"
		>
			<div ref={sectionRef} className="landing-faq-section__shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={reduceMotion ? false : 'hidden'}
					animate={reveal ? 'visible' : 'hidden'}
					variants={reduceMotion ? undefined : faqSectionVariants}
				>
					<motion.div variants={reduceMotion ? undefined : faqIntroVariants}>
						<LandingSectionIntro
							className="landing-faq-section__intro"
							align="center"
							title={t('home.faq.title')}
							lead={t('home.faq.lead')}
							titleId="portal-faq-heading"
							animateWhen={reveal}
						/>
					</motion.div>

					<div className="landing-faq__body">
						<motion.div
							className="landing-faq__list"
							variants={reduceMotion ? undefined : faqListVariants}
						>
							{faqItems.map((item) => (
								<motion.div
									key={item.id}
									className="landing-faq__item-motion"
									variants={reduceMotion ? undefined : faqItemVariants}
								>
									<FaqItem
										item={item}
										isOpen={openFaqId === item.id}
										onToggle={() => toggleFaq(item.id)}
										reduceMotion={reduceMotion}
									/>
								</motion.div>
							))}
						</motion.div>

						<motion.aside
							className="landing-faq__visual"
							aria-hidden
							initial={reduceMotion ? false : { opacity: 0, x: 24, scale: 0.97 }}
							animate={
								reveal
									? { opacity: 1, x: 0, scale: 1 }
									: { opacity: 0, x: 24, scale: 0.97 }
							}
							transition={
								reduceMotion
									? { duration: 0 }
									: { type: 'spring', stiffness: 170, damping: 22, delay: 0.1 }
							}
						>
							<div className="landing-faq__visual-glow" />
							<div className="landing-faq__visual-frame">
								<PortalFaqVector className="landing-faq__vector" />
							</div>
						</motion.aside>
					</div>
				</motion.div>
			</div>
		</section>
	)
}

export default PortalFaqSection
