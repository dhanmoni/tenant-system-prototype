const notices = [
	{
		date: 'Demo',
		text: 'Portal content is for demonstration; data and timelines are illustrative.',
	},
	{
		date: 'Demo',
		text: 'Use official circulars and gazette notifications for legal reference.',
	},
]

function NotificationsSection() {
	return (
		<section className="bg-white py-12 sm:py-16 lg:py-24" aria-labelledby="notifications-heading">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<p className="landing-section-eyebrow">Updates</p>
				<h2 id="notifications-heading" className="landing-section-title">
					Notifications
				</h2>
				<p className="landing-section-lead">
					Official updates and announcements will appear here.
				</p>
				<ul className="landing-notice-list mt-10">
					{notices.map((notice) => (
						<li key={notice.text}>
							<span className="landing-notice-date">{notice.date}</span>
							<span>{notice.text}</span>
						</li>
					))}
				</ul>
			</div>
		</section>
	)
}

export default NotificationsSection
