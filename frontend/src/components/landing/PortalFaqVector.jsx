/**
 * FAQ vector — lighter help-desk / document theme (caramel palette).
 */
function PortalFaqVector({ className = '' }) {
	return (
		<svg
			className={`portal-faq-vector ${className}`.trim()}
			viewBox="0 0 360 400"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-hidden
		>
			{/* Soft base */}
			<ellipse
				className="portal-faq-vector__shadow"
				cx="180"
				cy="368"
				rx="120"
				ry="18"
				fill="#f8cca0"
				fillOpacity="0.45"
			/>

			{/* Back sheet */}
			<g transform="translate(78 72) rotate(-7)">
				<g className="portal-faq-vector__sheet-back">
					<rect width="170" height="220" rx="18" fill="#fce6cf" stroke="#bf660d" strokeWidth="1.5" strokeOpacity="0.25" />
					<rect x="22" y="36" width="110" height="10" rx="5" fill="#f5b370" fillOpacity="0.7" />
					<rect x="22" y="58" width="88" height="8" rx="4" fill="#f5b370" fillOpacity="0.45" />
					<rect x="22" y="78" width="98" height="8" rx="4" fill="#f5b370" fillOpacity="0.35" />
				</g>
			</g>

			{/* Front sheet */}
			<g transform="translate(112 88) rotate(5)">
				<g className="portal-faq-vector__sheet-front">
					<rect width="176" height="232" rx="18" fill="#fff" stroke="#8f4c0a" strokeWidth="1.75" strokeOpacity="0.22" />
					<rect x="24" y="32" width="128" height="12" rx="6" fill="#fce6cf" />
					<rect x="24" y="56" width="96" height="9" rx="4.5" fill="#fdf2e7" />
					<rect x="24" y="76" width="112" height="9" rx="4.5" fill="#fdf2e7" />
					<rect x="24" y="106" width="128" height="52" rx="12" fill="#fdf2e7" />
					<circle cx="48" cy="132" r="12" fill="#ee8011" />
					<path
						d="M48 125v8M48 137.5v.5"
						stroke="#fff"
						strokeWidth="2.25"
						strokeLinecap="round"
					/>
					<rect x="70" y="124" width="66" height="8" rx="4" fill="#8f4c0a" fillOpacity="0.28" />
					<rect x="70" y="138" width="48" height="7" rx="3.5" fill="#8f4c0a" fillOpacity="0.16" />
					<rect x="24" y="176" width="128" height="10" rx="5" fill="#fce6cf" />
					<rect x="24" y="196" width="100" height="9" rx="4.5" fill="#fdf2e7" />
				</g>
			</g>

			{/* Floating help chip */}
			<g transform="translate(248 54)">
				<g className="portal-faq-vector__chip">
					<circle cx="36" cy="36" r="36" fill="url(#faq-chip)" />
					<path
						d="M36 22c-6.6 0-12 4.4-12 10.2 0 3.4 1.8 6.3 4.6 8.2L26 50l10.2-4.2c.6.1 1.2.2 1.8.2 6.6 0 12-4.4 12-10.2S42.6 22 36 22z"
						fill="#fff"
						fillOpacity="0.95"
					/>
					<circle cx="36" cy="30" r="2.2" fill="#8f4c0a" />
					<path d="M36 35v8" stroke="#8f4c0a" strokeWidth="2.5" strokeLinecap="round" />
				</g>
			</g>

			{/* Small check badge */}
			<g transform="translate(52 250)">
				<g className="portal-faq-vector__check">
					<circle cx="28" cy="28" r="28" fill="url(#faq-check)" />
					<path
						d="M18 29l7 7 14-15"
						stroke="#fff"
						strokeWidth="3.25"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</g>
			</g>

			<circle className="portal-faq-vector__dot portal-faq-vector__dot--a" cx="300" cy="300" r="5" fill="#ee8011" opacity="0.45" />
			<circle className="portal-faq-vector__dot portal-faq-vector__dot--b" cx="68" cy="120" r="4" fill="#bf660d" opacity="0.4" />

			<defs>
				<linearGradient id="faq-chip" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
					<stop stopColor="#f29940" />
					<stop offset="1" stopColor="#bf660d" />
				</linearGradient>
				<linearGradient id="faq-check" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
					<stop stopColor="#8f4c0a" />
					<stop offset="1" stopColor="#bf660d" />
				</linearGradient>
			</defs>
		</svg>
	)
}

export default PortalFaqVector
