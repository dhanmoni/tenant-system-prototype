import { Check, FileCheck, Layers } from 'lucide-react'
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
				<div className="get-started-layout">
					<div className="get-started-info min-w-0 space-y-8 sm:space-y-10">
						<div className="max-w-2xl">
							<h2 id="get-started-heading" className="landing-section-title">
								Get started
							</h2>
							<p className="landing-section-lead">
								Register or sign in with your mobile number to apply for services, track your
								application, and access tenancy services on this portal.
							</p>
						</div>

						<div className="get-started-audience">
							<div className="get-started-audience-grid">
								<AudienceCard
									icon={FileCheck}
									title="Apply for UIN"
									description="Register online and track your applications."
									items={[
										'Individual or Joint application (by agreement date)',
										'Track status from your dashboard',
										'Download acknowledgement when approved',
									]}
								/>
								<AudienceCard
									icon={Layers}
									title="Services provided"
									description="File, track, and manage tenancy matters with every authority from one dashboard."
									items={[
										'Rent Tribunal — appellate review (highest level)',
										'Rent Court — possession, eviction & appeals',
										'Rent Authority — rent revision, charges & disputes',
									]}
								/>
							</div>
						</div>
					</div>

					<div className="get-started-auth min-w-0">
						<AuthPanel {...authPanelProps} />
					</div>
				</div>
			</div>
		</section>
	)
}

export default GetStartedSection
