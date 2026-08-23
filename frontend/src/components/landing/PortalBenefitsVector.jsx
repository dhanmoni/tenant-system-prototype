import stateEmblem from '../../assets/img/TCP logo.png'

/**
 * Portal Benefits vector — tenancy certificate + digital verification (caramel palette).
 * Keeps the official state emblem as the focal mark.
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
				cy="492"
				rx="156"
				ry="18"
				fill="#f8cca0"
				fillOpacity="0.42"
			/>

			{/* Tenancy UIN certificate */}
			<g transform="translate(62 42)">
				<g className="portal-benefits-vector__card">
					<rect
						width="356"
						height="408"
						rx="16"
						fill="#fff"
						stroke="#c66300"
						strokeWidth="2"
						strokeOpacity="0.35"
					/>
					<rect width="356" height="14" rx="16" fill="#e87400" />
					<rect x="18" y="22" width="320" height="364" rx="10" fill="#fffcf8" stroke="#f9e4d4" strokeWidth="1.5" />

					{/* Ornate corner accents */}
					<path
						d="M34 38h36v3H34zM34 38v36h3V38zM322 38h36v3h-36zM355 38v36h-3V38zM34 374h36v3H34zM34 341v36h3v-36zM322 374h36v3h-36zM355 338v36h-3v-36z"
						fill="#e87400"
						fillOpacity="0.22"
					/>

					{/* Official state emblem */}
					<g className="portal-benefits-vector__seal" transform="translate(118 54)">
						<circle cx="60" cy="46" r="52" fill="#fff" stroke="#f9e4d4" strokeWidth="2" />
						<circle
							className="portal-benefits-vector__seal-ring"
							cx="60"
							cy="46"
							r="46"
							fill="none"
							stroke="#c66300"
							strokeWidth="2.5"
							strokeDasharray="3 4"
							strokeOpacity="0.55"
						/>
						<image
							href={stateEmblem}
							x="22"
							y="4"
							width="76"
							height="84"
							preserveAspectRatio="xMidYMid meet"
						/>
					</g>

					{/* Certificate header lines */}
					<rect x="88" y="168" width="180" height="8" rx="4" fill="#904400" fillOpacity="0.18" />
					<rect x="108" y="184" width="140" height="6" rx="3" fill="#f9e4d4" />
					<rect x="98" y="198" width="160" height="5" rx="2.5" fill="#fdf4eb" />

					{/* UIN block */}
					<rect x="44" y="224" width="268" height="54" rx="10" fill="#fff" stroke="#e87400" strokeWidth="1.5" strokeOpacity="0.35" />
					<rect x="58" y="238" width="72" height="7" rx="3.5" fill="#f9e4d4" />
					<rect x="58" y="254" width="196" height="10" rx="5" fill="#904400" fillOpacity="0.22" />

					{/* Detail rows */}
					<rect x="44" y="296" width="118" height="6" rx="3" fill="#fdf4eb" />
					<rect x="44" y="312" width="148" height="6" rx="3" fill="#fdf4eb" />
					<rect x="44" y="328" width="132" height="6" rx="3" fill="#fdf4eb" />
					<rect x="44" y="344" width="160" height="6" rx="3" fill="#fdf4eb" />

					{/* QR verification */}
					<rect x="248" y="292" width="64" height="64" rx="8" fill="#fff" stroke="#c66300" strokeWidth="1.5" strokeOpacity="0.4" />
					<rect x="258" y="302" width="12" height="12" rx="2" fill="#904400" fillOpacity="0.35" />
					<rect x="290" y="302" width="12" height="12" rx="2" fill="#904400" fillOpacity="0.35" />
					<rect x="258" y="334" width="12" height="12" rx="2" fill="#904400" fillOpacity="0.35" />
					<rect x="274" y="318" width="8" height="8" rx="1.5" fill="#e87400" fillOpacity="0.45" />
					<rect x="286" y="330" width="16" height="8" rx="2" fill="#c66300" fillOpacity="0.3" />

					{/* Approved stamp */}
					<circle cx="92" cy="368" r="24" fill="none" stroke="#e87400" strokeWidth="2" strokeOpacity="0.55" />
					<circle cx="92" cy="368" r="17" fill="#f9e4d4" fillOpacity="0.65" />
					<path
						d="M84 368l6 6 12-14"
						stroke="#904400"
						strokeWidth="2.25"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</g>
			</g>

			{/* Digital verification chip */}
			<g transform="translate(24 392)">
				<g className="portal-benefits-vector__chip">
					<rect
						width="128"
						height="58"
						rx="12"
						fill="url(#gov-chip)"
						stroke="#904400"
						strokeWidth="1.5"
						strokeOpacity="0.25"
					/>
					<rect x="14" y="14" width="52" height="8" rx="4" fill="#fff" fillOpacity="0.85" />
					<rect x="14" y="30" width="74" height="7" rx="3.5" fill="#fff" fillOpacity="0.5" />
					<circle cx="104" cy="29" r="10" fill="#fff" fillOpacity="0.9" />
					<path
						d="M100 29l3 3 6-7"
						stroke="#e87400"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</g>
			</g>

			{/* Shield trust badge */}
			<g transform="translate(352 88)">
				<g className="portal-benefits-vector__chip">
					<path
						d="M52 8L88 22v28c0 18-14 30-36 36C30 80 16 68 16 50V22L52 8z"
						fill="url(#gov-shield)"
						stroke="#904400"
						strokeWidth="1.5"
						strokeOpacity="0.28"
					/>
					<path
						d="M52 30l4 4 9-11"
						stroke="#fff"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</g>
			</g>

			<defs>
				<linearGradient id="gov-chip" x1="0" y1="0" x2="120" y2="56" gradientUnits="userSpaceOnUse">
					<stop stopColor="#f29940" />
					<stop offset="1" stopColor="#904400" />
				</linearGradient>
				<linearGradient id="gov-shield" x1="16" y1="8" x2="88" y2="86" gradientUnits="userSpaceOnUse">
					<stop stopColor="#f5b370" />
					<stop offset="0.55" stopColor="#e87400" />
					<stop offset="1" stopColor="#c66300" />
				</linearGradient>
			</defs>
		</svg>
	)
}

export default PortalBenefitsVector
