import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { landingFaqItems } from '../../data/landingFaq'

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
						className={`landing-faq__chevron h-4 w-4 shrink-0${isOpen ? ' is-open' : ''}`}
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
				<div className="text-center">
					<h2 id="portal-faq-heading" className="landing-section-title">
						Frequently asked questions
					</h2>
					<p className="landing-section-lead mx-auto max-w-2xl">
						Quick answers about UIN applications, required documents, and tracking your status.
					</p>
				</div>

				<div className="landing-faq__list mt-8 sm:mt-10">
					{landingFaqItems.map((item) => (
						<FaqItem
							key={item.id}
							item={item}
							isOpen={openFaqId === item.id}
							onToggle={() => toggleFaq(item.id)}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

export default PortalFaqSection
