import { motion } from 'framer-motion'
import howToImage from '../../assets/img/img2.png'

const steps = [
	{
		num: '1',
		title: 'Create your account',
		text: 'Register with your name, phone number, and district. Verify your identity using the OTP sent to your mobile.',
	},
	{
		num: '2',
		title: 'Log in and apply',
		text: 'Sign in to your dashboard, complete the tenancy certificate application, and upload the required documents.',
	},
	{
		num: '3',
		title: 'Track and download',
		text: 'Monitor application status in real-time and download your digitally signed tenancy certificate once approved.',
	},
]

function HowToApply() {
	return (
		<section id="how-to-apply" className="bg-white py-12 sm:py-16 lg:py-24" aria-labelledby="how-to-heading">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<p className="landing-section-eyebrow">Step by step</p>
				<h2 id="how-to-heading" className="landing-section-title">
					How to apply
				</h2>
				<p className="landing-section-lead">
					Follow these simple steps to register and apply for your tenancy certificate online.
				</p>
				<div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-12 xl:gap-16">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true, margin: '-60px' }}
						transition={{ duration: 0.45 }}
						className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200/60 lg:sticky lg:top-8"
					>
						<img
							src={howToImage}
							alt="Tenants and property officials completing a tenancy agreement"
							className="aspect-[4/5] w-full object-cover object-center sm:aspect-[3/4] lg:aspect-auto lg:min-h-[420px]"
							loading="lazy"
						/>
					</motion.div>
					<div className="grid gap-10 sm:gap-12 md:grid-cols-3">
						{steps.map((step, index) => (
						<motion.article
							key={step.num}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-60px' }}
							transition={{ duration: 0.4, delay: index * 0.1 }}
							className="relative"
						>
							<span
								className="pointer-events-none absolute -top-4 left-0 select-none text-[4.5rem] font-bold leading-none text-landing/15 sm:-top-6 sm:text-[6rem] md:text-[8rem] lg:text-[9rem]"
								aria-hidden
							>
								{step.num}
							</span>
							<div className="relative pt-10 sm:pt-14 md:pt-16">
								<h3 className="landing-section-subtitle">{step.title}</h3>
								<p className="landing-card-text mt-3">{step.text}</p>
							</div>
						</motion.article>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default HowToApply
