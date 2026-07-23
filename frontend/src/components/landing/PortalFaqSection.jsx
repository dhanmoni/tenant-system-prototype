import { useId, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import LandingSectionIntro from './LandingSectionIntro'
import { useLanguage } from '../../i18n'
import {
	faqIntroVariants,
	faqItemVariants,
	faqListVariants,
	faqSectionVariants,
} from '../../utils/landingMotion'

function FaqItem({ item, isOpen, onToggle }) {
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
			<div
				id={panelId}
				role="region"
				aria-labelledby={buttonId}
				aria-hidden={!isOpen}
				className={`landing-faq__panel${isOpen ? ' is-open' : ''}`}
				style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
			>
				<div className="landing-faq__panel-inner">
					<p className="landing-faq__answer">{item.answer}</p>
				</div>
			</div>
		</div>
	)
}

function PortalFaqSection() {
	const { t } = useLanguage()
	const [openFaqId, setOpenFaqId] = useState(null)
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

	const toggleFaq = (id) => {
		setOpenFaqId((prev) => (prev === id ? null : id))
	}

	return (
		<section
			id="portal-faq"
			className="landing-faq-section landing-wallpaper-bg landing-wallpaper-bg--cream scroll-mt-28 py-14 sm:py-16 lg:py-20"
			aria-labelledby="portal-faq-heading"
		>
			<div ref={sectionRef} className="landing-faq-section__shell mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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

					<motion.div
						className="landing-faq__list mt-10 sm:mt-12"
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
								/>
							</motion.div>
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	)
}

export default PortalFaqSection
