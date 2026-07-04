import tcpLogo from '../assets/img/TCP logo.png'

function PortalLoader({
	title = 'Loading portal',
	subtitle = 'Please wait while we prepare your session.',
	compact = false,
}) {
	return (
		<div
			className={`portal-loader${compact ? ' portal-loader--compact' : ''}`}
			role="status"
			aria-live="polite"
			aria-busy="true"
			aria-label={title}
		>
			<div className="portal-loader-visual" aria-hidden>
				<span className="portal-loader-orbit portal-loader-orbit--1" />
				<span className="portal-loader-orbit portal-loader-orbit--2" />
				<span className="portal-loader-orbit portal-loader-orbit--3" />
				<span className="portal-loader-ring" />
				<span className="portal-loader-core">
					<img
						src={tcpLogo}
						alt="Directorate of Town and Country Planning, Assam"
						className="portal-loader-emblem"
					/>
				</span>
			</div>

			<p className="portal-loader-brand">Assam Tenancy Registration Portal</p>
			<h2 className="portal-loader-title">{title}</h2>
			{subtitle ? <p className="portal-loader-subtitle">{subtitle}</p> : null}

			<div className="portal-loader-track" aria-hidden>
				<span className="portal-loader-track-fill" />
			</div>
		</div>
	)
}

export default PortalLoader
