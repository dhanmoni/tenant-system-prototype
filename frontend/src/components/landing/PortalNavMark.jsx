/**
 * Artistic portal mark — arched gateway + dwelling motif for the tenancy portal.
 */
function PortalNavMark({ className = '' }) {
	return (
		<svg
			className={`landing-nav-portal-mark ${className}`.trim()}
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-hidden
		>
			<defs>
				<linearGradient id="portalNavMarkSky" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
					<stop stopColor="#fff4e8" />
					<stop offset="1" stopColor="#f8d5b0" />
				</linearGradient>
				<linearGradient id="portalNavMarkRoof" x1="18" y1="18" x2="46" y2="34" gradientUnits="userSpaceOnUse">
					<stop stopColor="#e87400" />
					<stop offset="1" stopColor="#904400" />
				</linearGradient>
				<linearGradient id="portalNavMarkDoor" x1="28" y1="36" x2="36" y2="52" gradientUnits="userSpaceOnUse">
					<stop stopColor="#c66300" />
					<stop offset="0.55" stopColor="#904400" />
				</linearGradient>
			</defs>

			{/* Soft disc backdrop */}
			<circle cx="32" cy="32" r="29" fill="url(#portalNavMarkSky)" />
			<circle
				cx="32"
				cy="32"
				r="27.5"
				stroke="#c47a3a"
				strokeOpacity="0.35"
				strokeWidth="1.25"
			/>

			{/* Outer ornamental ring — dashed institutional seal feel */}
			<circle
				cx="32"
				cy="32"
				r="24.5"
				stroke="#c66300"
				strokeOpacity="0.45"
				strokeWidth="1.1"
				strokeDasharray="1.8 2.6"
			/>

			{/* Gateway arch */}
			<path
				d="M16 46.5V34C16 24.6 23.2 17 32 17C40.8 17 48 24.6 48 34V46.5"
				stroke="#904400"
				strokeWidth="2.1"
				strokeLinecap="round"
			/>
			<path
				d="M19.5 46V34.2C19.5 26.7 25.1 20.8 32 20.8C38.9 20.8 44.5 26.7 44.5 34.2V46"
				stroke="#e87400"
				strokeOpacity="0.55"
				strokeWidth="1.35"
				strokeLinecap="round"
			/>

			{/* Artistic dwelling nested in the arch */}
			<path
				d="M23.5 39.5L32 28.8L40.5 39.5"
				fill="url(#portalNavMarkRoof)"
				fillOpacity="0.92"
			/>
			<path
				d="M25.8 39.2V47.2H38.2V39.2"
				fill="#fff"
				fillOpacity="0.72"
				stroke="#904400"
				strokeWidth="1.35"
				strokeLinejoin="round"
			/>
			{/* Arched doorway */}
			<path
				d="M29.2 47.2V41.4C29.2 39.7 30.4 38.4 32 38.4C33.6 38.4 34.8 39.7 34.8 41.4V47.2"
				fill="url(#portalNavMarkDoor)"
			/>

			{/* Accent flourish — small leaf / scroll at sides */}
			<path
				d="M12.8 36.5C14.2 33.8 16.4 32.2 18.2 32.8"
				stroke="#c47a3a"
				strokeWidth="1.2"
				strokeLinecap="round"
			/>
			<path
				d="M51.2 36.5C49.8 33.8 47.6 32.2 45.8 32.8"
				stroke="#c47a3a"
				strokeWidth="1.2"
				strokeLinecap="round"
			/>
			{/* Soft ground curve */}
			<path
				d="M18 49.5C22.5 51.8 27 52.8 32 52.8C37 52.8 41.5 51.8 46 49.5"
				stroke="#c66300"
				strokeOpacity="0.4"
				strokeWidth="1.3"
				strokeLinecap="round"
			/>
		</svg>
	)
}

export default PortalNavMark
