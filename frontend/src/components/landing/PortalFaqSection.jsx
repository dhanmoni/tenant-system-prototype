import { useId, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import LandingSectionIntro from './LandingSectionIntro'
import { useLanguage } from '../../i18n'

function FaqItem({ item, isOpen, onToggle }) {
	const baseId = useId()
	const buttonId = `${baseId}-button`
	const panelId = `${baseId}-panel`

	return (
		<div className="landing-faq__item">
			<h3 className="m-0">
				<button
					type="button"
					id={buttonId}
					className="landing-faq__trigger"
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
				className="landing-faq__panel"
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
			className="landing-faq-section landing-wallpaper-bg landing-wallpaper-bg--white scroll-mt-28 py-12 sm:py-14 lg:py-16"
			aria-labelledby="portal-faq-heading"
		>
			<div className="landing-faq-section__shell mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<LandingSectionIntro
					className="landing-faq-section__intro"
					align="center"
					title={t('home.faq.title')}
					lead={t('home.faq.lead')}
					titleId="portal-faq-heading"
				/>

				<div className="landing-faq__list mt-9 sm:mt-10">
					{faqItems.map((item, index) => (
						<motion.div
							key={item.id}
							custom={index}
							initial={{ opacity: 0, y: 16, scale: 0.98 }}
							whileInView={{ opacity: 1, y: 0, scale: 1 }}
							viewport={{ once: true, margin: '-30px' }}
							transition={{
								type: 'spring',
								stiffness: 340,
								damping: 22,
								delay: index * 0.06,
							}}
						>
							<FaqItem
								item={item}
								isOpen={openFaqId === item.id}
								onToggle={() => toggleFaq(item.id)}
							/>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}

export default PortalFaqSection
