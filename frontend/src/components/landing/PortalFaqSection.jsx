import { useId, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { landingFaqItems } from '../../data/landingFaq'
import LandingSectionIntro from './LandingSectionIntro'

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
	const [openFaqId, setOpenFaqId] = useState(null)

	const toggleFaq = (id) => {
		setOpenFaqId((prev) => (prev === id ? null : id))
	}

	return (
		<section
			id="portal-faq"
			className="landing-faq-section landing-wallpaper-bg landing-wallpaper-bg--white scroll-mt-28 py-10 sm:py-12 lg:py-14"
			aria-labelledby="portal-faq-heading"
		>
			<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
				<LandingSectionIntro
					align="center"
					// eyebrow="Help centre"
					title="Frequently asked questions"
					lead="Quick answers about UIN applications, required documents, and tracking your status."
					titleId="portal-faq-heading"
				/>

				<div className="landing-faq__list mt-8 sm:mt-10">
					{landingFaqItems.map((item, index) => (
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
