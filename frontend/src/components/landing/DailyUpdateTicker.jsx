import { useReducedMotion } from 'framer-motion'
import { Bell } from 'lucide-react'

const dailyUpdates = [
	{
		date: '19 May 2026',
		text: 'Tenancy certificate applications are being accepted online through this portal.',
	},
	{
		date: '19 May 2026',
		text: 'Keep Aadhaar, rent agreement, and property details ready before you apply.',
	},
	{
		date: '18 May 2026',
		text: 'Track your application status anytime after signing in to your citizen account.',
	},
	{
		date: '17 May 2026',
		text: 'Helpdesk support is available on working days, 10:00 AM to 5:00 PM.',
	},
	{
		date: 'Demo',
		text: 'Updates shown here are for demonstration; refer to official circulars for legal notices.',
	},
]

function DailyUpdateItem({ date, text }) {
	return (
		<span className="daily-update-ticker-item">
			<span className="daily-update-ticker-date">{date}</span>
			<span className="daily-update-ticker-sep" aria-hidden>
				•
			</span>
			<span>{text}</span>
		</span>
	)
}

function DailyUpdateTicker() {
	const reduceMotion = useReducedMotion()
	const marqueeItems = [...dailyUpdates, ...dailyUpdates]

	return (
		<section
			className="daily-update-ticker"
			aria-label="Daily updates"
			aria-live={reduceMotion ? 'polite' : 'off'}
		>
			<div className="daily-update-ticker-inner">
				<div className="daily-update-ticker-badge">
					<Bell className="daily-update-ticker-badge-icon" aria-hidden />
					<span className="daily-update-ticker-badge-label daily-update-ticker-badge-label--long">
						Daily update
					</span>
					<span className="daily-update-ticker-badge-label daily-update-ticker-badge-label--short">
						Updates
					</span>
				</div>

				<div className="daily-update-ticker-viewport">
					{reduceMotion ? (
						<div className="daily-update-ticker-static">
							{dailyUpdates.map((item) => (
								<DailyUpdateItem key={`${item.date}-${item.text}`} {...item} />
							))}
						</div>
					) : (
						<div className="daily-update-ticker-track-wrap">
							<div className="daily-update-ticker-notify" aria-hidden>
								<Bell className="h-5 w-5" />
							</div>
							<div className="daily-update-ticker-track">
								<div className="daily-update-ticker-marquee">
									{marqueeItems.map((item, index) => (
										<DailyUpdateItem
											key={`${item.date}-${item.text}-${index}`}
											{...item}
										/>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	)
}

export default DailyUpdateTicker
