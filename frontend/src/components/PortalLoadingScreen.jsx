import PortalLoader from './PortalLoader'

function PortalLoadingScreen({
	title = 'Loading portal',
	subtitle = 'Please wait while we prepare your workspace.',
	compact = false,
	overlay = true,
}) {
	return (
		<div
			className={`portal-loading-screen landing-wallpaper-bg landing-wallpaper-bg--cream${
				overlay ? ' portal-loading-overlay' : ' page page-center'
			}`}
			role="presentation"
			aria-busy="true"
		>
			<div className="full-page-loader">
				<PortalLoader title={title} subtitle={subtitle} compact={compact} />
			</div>
		</div>
	)
}

export default PortalLoadingScreen
