import { useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import supportImage from '../../assets/img/img1.png'
import { landingFaqItems } from '../../data/landingFaq'

function SupportFaqItem({ item, isOpen, onToggle }) {
	const baseId = useId()
	const buttonId = `${baseId}-button`
	const panelId = `${baseId}-panel`

	return (
		<div className="border-t border-white/15 first:border-t-0">
			<h3 className="m-0">
				<button
					type="button"
					id={buttonId}
					className="need-support-faq__trigger"
					aria-expanded={isOpen}
					aria-controls={panelId}
					onClick={onToggle}
				>
					<span className="text-base font-bold leading-snug sm:text-lg">{item.question}</span>
					<ChevronDown
						className={`h-5 w-5 shrink-0 text-white transition-transform duration-300 ease-out${isOpen ? ' rotate-180' : ''}`}
						aria-hidden
					/>
				</button>
			</h3>
			<div
				id={panelId}
				role="region"
				aria-labelledby={buttonId}
				className="grid transition-[grid-template-rows] duration-300 ease-out"
				style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
			>
				<div className="overflow-hidden">
					<p className="m-0 pb-5 pr-8 text-sm leading-relaxed text-white/75 sm:text-base">
						{item.answer}
					</p>
				</div>
			</div>
		</div>
	)
}

function NeedSupportSection() {
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const [openFaqId, setOpenFaqId] = useState(landingFaqItems[0]?.id ?? null)
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start end', 'end start'],
	})
	const backgroundY = useTransform(scrollYProgress, (progress) =>
		reduceMotion ? 0 : (progress - 0.5) * 100,
	)

	const toggleFaq = (id) => {
		setOpenFaqId((prev) => (prev === id ? null : id))
	}

	return (
		<section
			ref={sectionRef}
			id="need-support"
			className="landing-need-support relative overflow-hidden bg-[#111111] text-white"
			aria-labelledby="need-support-heading"
		>
			<motion.div
				className="pointer-events-none absolute inset-x-0 top-[-15%] z-0 h-[130%] scale-105 bg-cover bg-center bg-no-repeat will-change-transform"
				style={{
					backgroundImage: `url(${supportImage})`,
					y: backgroundY,
				}}
				aria-hidden
			/>
			<div className="pointer-events-none absolute inset-0 z-[1] bg-[#111111]/82 sm:bg-gradient-to-r sm:from-[#111111]/95 sm:via-[#111111]/88 sm:to-[#111111]/55" aria-hidden />
			<div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
					<div className="max-w-xl">
						<h2 id="need-support-heading" className="text-3xl font-bold sm:text-4xl">
							Need Support?
						</h2>
						<p className="mt-3 text-base text-white/75 sm:text-lg">
							Reach out to us and we will get back to you
						</p>
					</div>
					<Link
						to="/contact"
						className="need-support-contact-link inline-flex shrink-0 items-center gap-2 rounded-md border border-white/90 bg-transparent px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
					>
						Get in touch
						<ArrowUpRight className="h-4 w-4" aria-hidden />
					</Link>
				</div>

				<div className="need-support-faq mt-12 max-w-3xl border-t border-white/15 pt-10 sm:mt-14">
					<h3 className="m-0 text-xl font-bold tracking-tight text-white sm:text-2xl">
						Frequently asked questions
					</h3>
					<div className="mt-6 border-b border-white/15">
						{landingFaqItems.map((item) => (
							<SupportFaqItem
								key={item.id}
								item={item}
								isOpen={openFaqId === item.id}
								onToggle={() => toggleFaq(item.id)}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default NeedSupportSection
