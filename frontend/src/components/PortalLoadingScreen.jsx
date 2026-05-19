import PortalLoader from './PortalLoader'

function PortalLoadingScreen({
	title = 'Loading portal',
	subtitle = 'Please wait while we prepare your workspace.',
	compact = false,
	overlay = false,
}) {
	return (
		<div
			className={`page page-center landing-wallpaper-bg landing-wallpaper-bg--cream portal-loading-screen${overlay ? ' portal-loading-overlay' : ''}`}
			role="presentation"
		>
			<div className="full-page-loader">
				<PortalLoader title={title} subtitle={subtitle} compact={compact} />
			</div>
		</div>
	)
}

export default PortalLoadingScreen
