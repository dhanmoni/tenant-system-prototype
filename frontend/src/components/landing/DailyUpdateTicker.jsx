import { useReducedMotion } from 'framer-motion'

const updates = [
	// {
	// 	id: 'docs',
	// 	text: 'Keep pan card, rent agreement, passport size photograph and signature ready before you apply.',
	// },
	{
		id: 'uin-joint',
		text: 'UIN apply: agreements within 2 months of registration are Joint — both parties must apply.',
	},
	{
		id: 'uin-individual',
		text: 'UIN apply: agreements older than 2 months (up to 3 months) may be submitted as Individual application.',
	},
	// {
	// 	id: 'track',
	// 	text: 'Track your application status anytime after signing in to your account.',
	// },
]

function NoticeItem({ text }) {
	return (
		<span className="daily-update-ticker-item">
			<span className="daily-update-ticker-bullet" aria-hidden>
				•
			</span>
			<span>{text}</span>
		</span>
	)
}

function DailyUpdateTicker() {
	const reduceMotion = useReducedMotion()
	const marqueeItems = [...updates, ...updates]

	return (
		<section
			className="daily-update-ticker"
			aria-label="Notices"
			aria-live={reduceMotion ? 'polite' : 'off'}
		>
			<div className="daily-update-ticker-inner">
				<div className="daily-update-ticker-badge">Notices</div>

				<div className="daily-update-ticker-viewport">
					{reduceMotion ? (
						<div className="daily-update-ticker-static">
							{updates.map((item) => (
								<NoticeItem key={item.id} text={item.text} />
							))}
						</div>
					) : (
						<div className="daily-update-ticker-track">
							<div className="daily-update-ticker-marquee">
								{marqueeItems.map((item, index) => (
									<NoticeItem key={`${item.id}-${index}`} text={item.text} />
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	)
}

export default DailyUpdateTicker
