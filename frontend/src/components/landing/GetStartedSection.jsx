import { motion } from 'framer-motion'
import { Building2, Check, UserRound } from 'lucide-react'
import AuthPanel from './AuthPanel'

function AudienceCard({ title, description, items, icon: Icon }) {
	return (
		<article className="get-started-audience-card">
			<div className="get-started-audience-card__header">
				<span className="get-started-audience-card__icon" aria-hidden>
					<Icon className="h-5 w-5" strokeWidth={2.25} />
				</span>
				<h3 className="get-started-audience-card__title">{title}</h3>
			</div>
			<div className="get-started-audience-card__body">
				<p className="get-started-audience-card__lead">{description}</p>
				<ul className="get-started-audience-card__list">
					{items.map((item) => (
						<li key={item}>
							<Check className="h-4 w-4 shrink-0" aria-hidden strokeWidth={2.5} />
							<span>{item}</span>
						</li>
					))}
				</ul>
			</div>
		</article>
	)
}

function GetStartedSection({ authPanelProps }) {
	return (
		<section
			id="portal-content"
			className="get-started-section landing-wallpaper-bg landing-wallpaper-bg--cream relative z-10 pt-10 pb-12 sm:pt-12 sm:pb-16 md:pb-20"
			aria-labelledby="get-started-heading"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:gap-10 xl:gap-12">
					<div className="order-2 min-w-0 space-y-8 sm:space-y-10 lg:order-1">
						<motion.div
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.4 }}
							className="max-w-2xl"
						>
							<p className="landing-section-eyebrow">Citizen access</p>
							<h2 id="get-started-heading" className="landing-section-title">
								Get started
							</h2>
							<p className="landing-section-lead">
								Register or sign in with your mobile number to apply for tenancy certificates and
								manage your applications online.
							</p>
						</motion.div>

						<div className="get-started-audience">
							<p className="get-started-audience__eyebrow">Who can use this portal</p>
							<div className="get-started-audience-grid">
								<motion.div
									initial={{ opacity: 0, y: 16 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.45 }}
									className="h-full"
								>
									<AudienceCard
										icon={UserRound}
										title="For tenants"
										description="Apply for certificates, track your application, and access signed records anytime."
										items={[
											'Digital certificate download',
											'Real-time application tracking',
											'Secure access 24×7',
										]}
									/>
								</motion.div>
								<motion.div
									initial={{ opacity: 0, y: 16 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.45, delay: 0.08 }}
									className="h-full"
								>
									<AudienceCard
										icon={Building2}
										title="For owners"
										description="Register properties, manage tenant records, and stay aligned with tenancy rules."
										items={[
											'Property & tenant dashboard',
											'Digital record keeping',
											'Compliance visibility',
										]}
									/>
								</motion.div>
							</div>
						</div>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.08 }}
						className="order-1 min-w-0 lg:order-2 lg:sticky lg:top-6 xl:top-8"
					>
						<AuthPanel {...authPanelProps} />
					</motion.div>
				</div>
			</div>
		</section>
	)
}

export default GetStartedSection
