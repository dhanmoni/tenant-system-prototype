/**
 * Soft animated watermark for Portal Services — register, seal, key.
 * Motion is CSS-driven and disabled under prefers-reduced-motion.
 */
function PortalServicesWatermark({ className = '' }) {
	return (
		<svg
			className={`portal-services-showcase__watermark ${className}`.trim()}
			viewBox="0 0 460 300"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden
			focusable="false"
		>
			{/* Open register / ledger */}
			<g className="portal-services-wm__register">
				<path
					d="M40 56c0-8 6-14 14-14h120c18 0 28 10 42 10s24-10 42-10h120c8 0 14 6 14 14v188c0 8-6 14-14 14H216c-14 0-24-8-38-8s-24 8-38 8H54c-8 0-14-6-14-14V56z"
					fill="#e87400"
					fillOpacity="0.05"
					stroke="#904400"
					strokeOpacity="0.28"
					strokeWidth="2"
				/>
				<path d="M218 42v216" stroke="#904400" strokeOpacity="0.22" strokeWidth="1.8" />
				<g className="portal-services-wm__lines" stroke="#904400" strokeLinecap="round" strokeWidth="2">
					<path className="portal-services-wm__line portal-services-wm__line--1" d="M68 88h120" strokeOpacity="0.16" />
					<path className="portal-services-wm__line portal-services-wm__line--2" d="M68 112h108" strokeOpacity="0.16" />
					<path className="portal-services-wm__line portal-services-wm__line--3" d="M68 136h116" strokeOpacity="0.16" />
					<path className="portal-services-wm__line portal-services-wm__line--4" d="M68 160h96" strokeOpacity="0.16" />
					<path className="portal-services-wm__line portal-services-wm__line--5" d="M248 88h120" strokeOpacity="0.16" />
					<path className="portal-services-wm__line portal-services-wm__line--6" d="M248 112h108" strokeOpacity="0.16" />
					<path className="portal-services-wm__line portal-services-wm__line--7" d="M248 136h116" strokeOpacity="0.16" />
					<path className="portal-services-wm__line portal-services-wm__line--8" d="M248 160h96" strokeOpacity="0.16" />
				</g>
			</g>

			{/* Official seal */}
			<g transform="translate(168 148)">
				<g className="portal-services-wm__seal">
					<circle
						className="portal-services-wm__seal-ring"
						cx="62"
						cy="62"
						r="58"
						fill="#e87400"
						fillOpacity="0.07"
						stroke="#904400"
						strokeOpacity="0.3"
						strokeWidth="2"
					/>
					<circle
						className="portal-services-wm__seal-dash"
						cx="62"
						cy="62"
						r="46"
						fill="none"
						stroke="#904400"
						strokeOpacity="0.2"
						strokeWidth="1.4"
						strokeDasharray="3 4"
					/>
					<circle
						cx="62"
						cy="62"
						r="34"
						fill="none"
						stroke="#904400"
						strokeOpacity="0.26"
						strokeWidth="1.6"
					/>
					<path
						d="M42 78V58l20-14 20 14v20"
						fill="#e87400"
						fillOpacity="0.06"
						stroke="#904400"
						strokeOpacity="0.32"
						strokeWidth="1.8"
						strokeLinejoin="round"
					/>
					<path
						d="M56 78V66h12v12"
						stroke="#904400"
						strokeOpacity="0.3"
						strokeWidth="1.6"
						strokeLinejoin="round"
					/>
				</g>
			</g>

			{/* Key */}
			<g transform="translate(360 198)">
				<g
					className="portal-services-wm__key"
					stroke="#904400"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="22" cy="22" r="16" fill="#e87400" fillOpacity="0.06" strokeOpacity="0.28" strokeWidth="1.8" />
					<circle cx="22" cy="22" r="7" fill="none" strokeOpacity="0.24" strokeWidth="1.5" />
					<path d="M36 28h48v8M68 36v10M78 36v14" strokeOpacity="0.26" strokeWidth="1.8" />
				</g>
			</g>
		</svg>
	)
}

export default PortalServicesWatermark
