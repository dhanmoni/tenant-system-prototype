import tcpLogo from '../../assets/img/TCP logo.png'

/**
 * Portal Benefits vector — government / e-governance style (caramel palette).
 */
function PortalBenefitsVector({ className = '' }) {
	return (
		<svg
			className={`portal-benefits-vector ${className}`.trim()}
			viewBox="0 0 480 520"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-hidden
		>
			<ellipse
				className="portal-benefits-vector__shadow"
				cx="240"
				cy="482"
				rx="150"
				ry="18"
				fill="#f8cca0"
				fillOpacity="0.42"
			/>

			{/* Institutional building */}
			<g className="portal-benefits-vector__building" transform="translate(96 168)">
				<rect x="20" y="248" width="248" height="14" rx="4" fill="#fce6cf" />
				<rect x="36" y="262" width="216" height="12" rx="4" fill="#f8cca0" />

				<rect x="48" y="120" width="192" height="128" rx="6" fill="url(#gov-build)" />

				<path d="M24 120L144 48L264 120H24Z" fill="#8f4c0a" />
				<path d="M40 120L144 62L248 120H40Z" fill="#bf660d" />
				<path d="M56 120L144 76L232 120H56Z" fill="#ee8011" />

				<g className="portal-benefits-vector__windows">
					<rect x="68" y="128" width="22" height="112" rx="4" fill="#fff" fillOpacity="0.55" />
					<rect x="110" y="128" width="22" height="112" rx="4" fill="#fff" fillOpacity="0.55" />
					<rect x="152" y="128" width="22" height="112" rx="4" fill="#fff" fillOpacity="0.55" />
					<rect x="194" y="128" width="22" height="112" rx="4" fill="#fff" fillOpacity="0.55" />
				</g>

				<rect x="124" y="168" width="40" height="72" rx="6" fill="#8f4c0a" fillOpacity="0.45" />
				<rect x="130" y="174" width="28" height="66" rx="4" fill="#fff" fillOpacity="0.35" />
			</g>

			{/* Official circular seal with TCP emblem */}
			<g transform="translate(292 78)">
				<g className="portal-benefits-vector__seal">
					<circle cx="62" cy="62" r="62" fill="#8f4c0a" />
					<circle cx="62" cy="62" r="56" fill="#fff" />
					<circle
						className="portal-benefits-vector__seal-ring"
						cx="62"
						cy="62"
						r="50"
						fill="none"
						stroke="#bf660d"
						strokeWidth="3.5"
						strokeDasharray="2.5 3.5"
					/>
					<circle cx="62" cy="62" r="40" fill="url(#gov-seal)" />
					<circle cx="62" cy="62" r="34" fill="none" stroke="#fce6cf" strokeWidth="1.75" opacity="0.85" />
					<circle cx="62" cy="62" r="22" fill="#fff" />
					<image
						href={tcpLogo}
						x="46"
						y="44"
						width="32"
						height="36"
						preserveAspectRatio="xMidYMid meet"
					/>
					<g className="portal-benefits-vector__seal-dots">
						<circle cx="62" cy="16" r="2.2" fill="#ee8011" />
						<circle cx="26" cy="34" r="2" fill="#ee8011" />
						<circle cx="98" cy="34" r="2" fill="#ee8011" />
						<circle cx="26" cy="90" r="2" fill="#ee8011" />
						<circle cx="98" cy="90" r="2" fill="#ee8011" />
						<circle cx="62" cy="108" r="2.2" fill="#ee8011" />
					</g>
				</g>
			</g>

			{/* Official certificate / UIN card */}
			<g transform="translate(52 300)">
				<g className="portal-benefits-vector__card">
					<rect
						width="160"
						height="112"
						rx="12"
						fill="#fff"
						stroke="#bf660d"
						strokeWidth="2"
						strokeOpacity="0.4"
					/>
					<rect x="0" y="0" width="160" height="10" rx="12" fill="#ee8011" />
					<rect x="12" y="24" width="88" height="8" rx="4" fill="#fce6cf" />
					<rect x="12" y="40" width="64" height="6" rx="3" fill="#fdf2e7" />
					<rect x="12" y="54" width="100" height="6" rx="3" fill="#fdf2e7" />
					<circle cx="128" cy="72" r="22" fill="none" stroke="#ee8011" strokeWidth="2" />
					<circle cx="128" cy="72" r="14" fill="#fce6cf" />
					<path
						d="M122 72l4 4 8-10"
						stroke="#8f4c0a"
						strokeWidth="2.25"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<rect x="12" y="88" width="72" height="8" rx="3" fill="#8f4c0a" fillOpacity="0.2" />
				</g>
			</g>

			{/* Digital service chip */}
			<g transform="translate(280 360)">
				<g className="portal-benefits-vector__chip">
					<rect
						width="120"
						height="56"
						rx="12"
						fill="url(#gov-chip)"
						stroke="#8f4c0a"
						strokeWidth="1.5"
						strokeOpacity="0.25"
					/>
					<rect x="14" y="14" width="48" height="8" rx="4" fill="#fff" fillOpacity="0.85" />
					<rect x="14" y="30" width="70" height="7" rx="3.5" fill="#fff" fillOpacity="0.5" />
					<circle cx="98" cy="28" r="10" fill="#fff" fillOpacity="0.9" />
					<path
						d="M94 28l3 3 6-7"
						stroke="#ee8011"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</g>
			</g>

			<defs>
				<linearGradient id="gov-build" x1="48" y1="120" x2="240" y2="248" gradientUnits="userSpaceOnUse">
					<stop stopColor="#f5b370" />
					<stop offset="0.55" stopColor="#ee8011" />
					<stop offset="1" stopColor="#bf660d" />
				</linearGradient>
				<linearGradient id="gov-seal" x1="20" y1="20" x2="96" y2="96" gradientUnits="userSpaceOnUse">
					<stop stopColor="#bf660d" />
					<stop offset="1" stopColor="#8f4c0a" />
				</linearGradient>
				<linearGradient id="gov-chip" x1="0" y1="0" x2="120" y2="56" gradientUnits="userSpaceOnUse">
					<stop stopColor="#f29940" />
					<stop offset="1" stopColor="#8f4c0a" />
				</linearGradient>
			</defs>
		</svg>
	)
}

export default PortalBenefitsVector
