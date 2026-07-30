import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
	ASSAM_DISTRICTS_GEOJSON_URL,
	ASSAM_SUBDISTRICTS_GEOJSON_URL,
	ASSAM_MAP_CENTER,
	ASSAM_MAP_ZOOM,
	buildDistrictLookup,
	buildSubdivisionLookup,
	findDistrictForGeoFeature,
	findSubdivisionStats,
	geoFeatureMatchesDistrictName,
	subdistrictFeatureName,
} from '../../../utils/assamDistrictGeo'

function fillForVolume(total, max) {
	if (!max || !total) return '#eef2f7'
	const ratio = total / max
	if (ratio >= 0.75) return '#1d4ed8'
	if (ratio >= 0.4) return '#3b82f6'
	if (ratio > 0) return '#bfdbfe'
	return '#eef2f7'
}

function escapeHtml(text) {
	return String(text || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

/** Compact label for crowded statewide view. */
function shortenPlaceLabel(name, maxLen = 14) {
	const raw = String(name || '').trim()
	if (!raw) return ''
	if (raw.length <= maxLen) return raw
	const compact = raw
		.replace(/\bSouth\b/i, 'S.')
		.replace(/\bNorth\b/i, 'N.')
		.replace(/\bEast\b/i, 'E.')
		.replace(/\bWest\b/i, 'W.')
		.replace(/\bMetropolitan\b/i, 'Metro')
		.replace(/\bMankachar\b/i, 'Mank.')
		.replace(/\bAnglong\b/i, 'Ang.')
	if (compact.length <= maxLen) return compact
	return `${compact.slice(0, maxLen - 1)}…`
}

/**
 * Google Maps–style place names centered on each polygon (horizontal, clipped).
 */
function PlaceLabels({ geojson, getLabel, variant = 'district' }) {
	const map = useMap()

	useEffect(() => {
		if (!geojson?.features?.length) return undefined

		if (!map.getPane('place-labels')) {
			map.createPane('place-labels')
		}
		const pane = map.getPane('place-labels')
		pane.style.zIndex = 650
		pane.style.pointerEvents = 'none'
		pane.style.overflow = 'hidden'

		const group = L.layerGroup()
		const isCrowded = variant === 'district'
		const maxLen = variant === 'subdistrict' ? 16 : variant === 'district-focus' ? 22 : 13
		const minGapX = isCrowded ? 52 : 40
		const minGapY = isCrowded ? 16 : 14
		const placed = []

		const candidates = geojson.features
			.map((feature) => {
				const fullName = getLabel?.(feature)
				if (!fullName) return null
				const bounds = L.geoJSON(feature).getBounds()
				if (!bounds.isValid()) return null
				const center = bounds.getCenter()
				const point = map.latLngToLayerPoint(center)
				const area =
					Math.abs(bounds.getNorth() - bounds.getSouth()) *
					Math.abs(bounds.getEast() - bounds.getWest())
				return { feature, fullName, center, point, area }
			})
			.filter(Boolean)
			.sort((a, b) => b.area - a.area)

		candidates.forEach((item) => {
			const overlaps = placed.some(
				(p) =>
					Math.abs(p.x - item.point.x) < minGapX &&
					Math.abs(p.y - item.point.y) < minGapY
			)
			if (overlaps) return

			const label = isCrowded
				? shortenPlaceLabel(item.fullName, maxLen)
				: item.fullName.length > maxLen
					? shortenPlaceLabel(item.fullName, maxLen)
					: item.fullName

			const marker = L.marker(item.center, {
				interactive: false,
				keyboard: false,
				pane: 'place-labels',
				icon: L.divIcon({
					className: `ws-assam-map-place-label ws-assam-map-place-label--${variant}`,
					html: `<span title="${escapeHtml(item.fullName)}">${escapeHtml(label)}</span>`,
					iconSize: [1, 1],
					iconAnchor: [0, 0],
				}),
			})
			group.addLayer(marker)
			placed.push({ x: item.point.x, y: item.point.y })
		})

		group.addTo(map)
		return () => {
			map.removeLayer(group)
		}
	}, [map, geojson, getLabel, variant])

	return null
}

function fitMapToView(
	map,
	geojson,
	{ zoomTargetName, viewMode, fillPadding, singleDistrict, fillContainer = false, animate = false }
) {
	if (!geojson?.features?.length) return
	if (!map || !map.getSize || map.getSize().x < 2 || map.getSize().y < 2) return

	const pad = fillPadding || (fillContainer ? [12, 12] : [16, 16])
	const fitOptions = {
		padding: pad,
		animate: Boolean(animate),
		duration: 0.35,
	}

	if (singleDistrict) {
		const layer = L.geoJSON(geojson)
		const bounds = layer.getBounds()
		if (bounds.isValid()) {
			map.stop()
			map.fitBounds(bounds, {
				...fitOptions,
				padding: pad,
				maxZoom: 12,
			})
		}
		return
	}

	if (viewMode === 'state' || !zoomTargetName) {
		const layer = L.geoJSON(geojson)
		const bounds = layer.getBounds()
		if (bounds.isValid()) {
			map.stop()
			// No low maxZoom cap — desktop frames are large; capping left Assam
			// looking like a mobile-sized map inside a bigger grey canvas.
			map.fitBounds(bounds, {
				...fitOptions,
				padding: fillContainer ? [10, 10] : pad,
				maxZoom: map.getMaxZoom(),
			})
		}
		return
	}

	const focus = String(zoomTargetName).toLowerCase()
	const match = geojson.features.find((f) => {
		const name = String(f.properties?.district || '').toLowerCase()
		return (
			name === focus ||
			name.includes(focus) ||
			focus.includes(name) ||
			(focus.includes('kamrup rural') && name === 'kamrup') ||
			(focus.includes('south salmara') && name.includes('salmara'))
		)
	})

	if (match) {
		const bounds = L.geoJSON(match).getBounds()
		if (bounds.isValid()) {
			map.stop()
			map.fitBounds(bounds, {
				...fitOptions,
				padding: [24, 24],
				maxZoom: 12,
			})
		}
	}
}

/**
 * Keep Leaflet size in sync with the frame. On meaningful size changes
 * (desktop layout settle / window resize), re-fit so Assam scales with the canvas.
 */
function MapResizeSync({
	geojson,
	zoomTargetName,
	viewMode,
	padX = 20,
	padY = 20,
	singleDistrict,
	fillContainer = false,
	fitNonce = 0,
}) {
	const map = useMap()
	const lastSize = useRef({ w: 0, h: 0 })
	const fitArgsRef = useRef({})

	fitArgsRef.current = {
		geojson,
		zoomTargetName,
		viewMode,
		padX,
		padY,
		singleDistrict,
		fillContainer,
	}

	const runFit = useCallback(
		(animate = false) => {
			const args = fitArgsRef.current
			if (!args.geojson) return
			map.invalidateSize({ animate: false })
			fitMapToView(map, args.geojson, {
				zoomTargetName: args.zoomTargetName,
				viewMode: args.viewMode,
				fillPadding: [args.padX, args.padY],
				singleDistrict: args.singleDistrict,
				fillContainer: args.fillContainer,
				animate,
			})
		},
		[map]
	)

	useEffect(() => {
		const container = map.getContainer()
		let raf = 0

		const onFrameResize = () => {
			cancelAnimationFrame(raf)
			raf = requestAnimationFrame(() => {
				const el = container.parentElement || container
				const w = el.clientWidth
				const h = el.clientHeight
				const prev = lastSize.current
				const dw = Math.abs(w - prev.w)
				const dh = Math.abs(h - prev.h)
				if (dw < 2 && dh < 2) return

				const firstLayout = prev.w === 0 || prev.h === 0
				// Ignore tiny scrollbar flicker; re-fit when the frame actually grows/shrinks
				// (mobile → desktop canvas, sidebar collapse, window resize).
				const significant = firstLayout || dw >= 48 || dh >= 48
				lastSize.current = { w, h }
				map.invalidateSize({ animate: false })
				if (significant) {
					runFit(false)
				}
			})
		}

		onFrameResize()
		const ro =
			typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onFrameResize) : null
		ro?.observe(container.parentElement || container)
		window.addEventListener('orientationchange', onFrameResize)

		return () => {
			cancelAnimationFrame(raf)
			ro?.disconnect()
			window.removeEventListener('orientationchange', onFrameResize)
		}
	}, [map, runFit])

	useEffect(() => {
		runFit(fitNonce > 0)
		// Layout often settles after fonts/sidebar; second pass fills desktop canvas.
		const t1 = window.setTimeout(() => runFit(false), 80)
		const t2 = window.setTimeout(() => runFit(false), 320)
		return () => {
			window.clearTimeout(t1)
			window.clearTimeout(t2)
		}
	}, [runFit, geojson, zoomTargetName, viewMode, padX, padY, singleDistrict, fillContainer, fitNonce])

	return null
}

/** Pane so sub-division outlines sit above district fills. */
function SubdistrictPane() {
	const map = useMap()
	useEffect(() => {
		if (!map.getPane('subdistricts')) {
			map.createPane('subdistricts')
		}
		const pane = map.getPane('subdistricts')
		if (pane) pane.style.zIndex = 450
	}, [map])
	return null
}

const SUB_FOCUS_HATCH_ID = 'ws-assam-sub-hatch'

/** Diagonal hatch pattern used for the focused sub-division fill. */
function SubdistrictHatchPattern() {
	const map = useMap()

	useEffect(() => {
		const ns = 'http://www.w3.org/2000/svg'

		const ensurePattern = () => {
			const pane = map.getPane('subdistricts')
			if (!pane) return
			const svg = pane.querySelector('svg')
			if (!svg) return
			if (svg.querySelector(`#${SUB_FOCUS_HATCH_ID}`)) return

			let defs = svg.querySelector('defs')
			if (!defs) {
				defs = document.createElementNS(ns, 'defs')
				svg.insertBefore(defs, svg.firstChild)
			}

			const pattern = document.createElementNS(ns, 'pattern')
			pattern.setAttribute('id', SUB_FOCUS_HATCH_ID)
			pattern.setAttribute('patternUnits', 'userSpaceOnUse')
			pattern.setAttribute('width', '8')
			pattern.setAttribute('height', '8')
			pattern.setAttribute('patternTransform', 'rotate(45)')

			const bg = document.createElementNS(ns, 'rect')
			bg.setAttribute('width', '8')
			bg.setAttribute('height', '8')
			bg.setAttribute('fill', '#fdba74')
			pattern.appendChild(bg)

			const stripe = document.createElementNS(ns, 'rect')
			stripe.setAttribute('width', '8')
			stripe.setAttribute('height', '3.5')
			stripe.setAttribute('y', '0')
			stripe.setAttribute('fill', '#c2410c')
			stripe.setAttribute('fill-opacity', '0.85')
			pattern.appendChild(stripe)

			defs.appendChild(pattern)
		}

		ensurePattern()
		map.on('layeradd zoom viewreset', ensurePattern)
		const pane = map.getPane('subdistricts')
		const mo =
			pane && typeof MutationObserver !== 'undefined'
				? new MutationObserver(ensurePattern)
				: null
		mo?.observe(pane, { childList: true, subtree: true })

		return () => {
			map.off('layeradd zoom viewreset', ensurePattern)
			mo?.disconnect()
		}
	}, [map])

	return null
}

/** Simple + / − zoom buttons (no scroll-wheel zoom). */
function MapZoomControls() {
	const map = useMap()
	const [zoom, setZoom] = useState(() => map.getZoom())
	const rootRef = useRef(null)

	useEffect(() => {
		const syncZoom = () => setZoom(map.getZoom())
		map.on('zoomend zoom', syncZoom)
		syncZoom()
		return () => {
			map.off('zoomend zoom', syncZoom)
		}
	}, [map])

	useEffect(() => {
		const el = rootRef.current
		if (!el) return undefined
		L.DomEvent.disableClickPropagation(el)
		L.DomEvent.disableScrollPropagation(el)
		return undefined
	}, [])

	const minZoom = map.getMinZoom()
	const maxZoom = map.getMaxZoom()
	const zoomValue = Math.round(zoom)

	return createPortal(
		<div ref={rootRef} className="ws-assam-map-zoom" role="group" aria-label="Map zoom">
			<button
				type="button"
				className="ws-assam-map-zoom__btn"
				onClick={(e) => {
					e.preventDefault()
					e.stopPropagation()
					map.setZoom(Math.min(maxZoom, zoomValue + 1))
				}}
				disabled={zoomValue >= maxZoom}
				aria-label="Zoom in"
				title="Zoom in"
			>
				+
			</button>
			<button
				type="button"
				className="ws-assam-map-zoom__btn"
				onClick={(e) => {
					e.preventDefault()
					e.stopPropagation()
					map.setZoom(Math.max(minZoom, zoomValue - 1))
				}}
				disabled={zoomValue <= minZoom}
				aria-label="Zoom out"
				title="Zoom out"
			>
				−
			</button>
		</div>,
		map.getContainer()
	)
}

/** Fit map to the selected sub-division polygon. */
function SubdistrictFocusSync({ geojson, activeName, enabled }) {
	const map = useMap()
	const lastFit = useRef('')

	useEffect(() => {
		if (!enabled || !activeName || !geojson?.features?.length) return
		const key = `${activeName}|${geojson.features.length}`
		if (lastFit.current === key) return

		const match = geojson.features.find(
			(f) => normalizeLoose(subdistrictFeatureName(f)) === normalizeLoose(activeName)
		)
		if (!match) return

		const bounds = L.geoJSON(match).getBounds()
		if (!bounds.isValid()) return
		lastFit.current = key
		map.stop()
		map.fitBounds(bounds, {
			padding: [40, 40],
			maxZoom: 12,
			animate: true,
			duration: 0.35,
		})
	}, [map, geojson, activeName, enabled])

	useEffect(() => {
		if (!activeName) lastFit.current = ''
	}, [activeName])

	return null
}

/**
 * @param {object} props
 * @param {boolean} [props.lockToDistrict] — district admin: stay on own district, no other-district nav
 * @param {boolean} [props.fillContainer] — super admin: large map that fills the block
 */
function AssamDistrictMap({
	districts = [],
	hint,
	focusDistrictName = null,
	onDistrictSelect,
	lockToDistrict = false,
	fillContainer = false,
}) {
	const [geojson, setGeojson] = useState(null)
	const [subGeojson, setSubGeojson] = useState(null)
	const [loadError, setLoadError] = useState('')
	const [selected, setSelected] = useState(null)
	const [viewMode, setViewMode] = useState(
		lockToDistrict || focusDistrictName ? 'district' : 'state'
	)
	const [zoomTarget, setZoomTarget] = useState(focusDistrictName || null)
	const [fitNonce, setFitNonce] = useState(0)
	const [showSubdivisions, setShowSubdivisions] = useState(true)
	const [activeSubdistrict, setActiveSubdistrict] = useState(null)

	useEffect(() => {
		let cancelled = false
		fetch(ASSAM_DISTRICTS_GEOJSON_URL)
			.then((res) => {
				if (!res.ok) throw new Error('Could not load Assam map')
				return res.json()
			})
			.then((data) => {
				if (!cancelled) setGeojson(data)
			})
			.catch((err) => {
				if (!cancelled) {
					setGeojson(null)
					setLoadError(err.message || 'Failed to load Assam map')
				}
			})
		return () => {
			cancelled = true
		}
	}, [])

	useEffect(() => {
		let cancelled = false
		fetch(ASSAM_SUBDISTRICTS_GEOJSON_URL)
			.then((res) => {
				if (!res.ok) throw new Error('Could not load sub-divisions')
				return res.json()
			})
			.then((data) => {
				if (!cancelled) setSubGeojson(data)
			})
			.catch(() => {
				if (!cancelled) setSubGeojson(null)
			})
		return () => {
			cancelled = true
		}
	}, [])

	useEffect(() => {
		if (!focusDistrictName || !districts.length) return
		const match = districts.find(
			(d) => normalizeLoose(d.name) === normalizeLoose(focusDistrictName)
		)
		if (match) {
			setSelected(match)
			setZoomTarget(match.name)
			setViewMode('district')
		}
	}, [focusDistrictName, districts])

	const lookup = useMemo(() => buildDistrictLookup(districts), [districts])
	const subdivisionLookup = useMemo(() => buildSubdivisionLookup(districts), [districts])
	const maxTotal = useMemo(
		() => Math.max(0, ...districts.map((d) => d.total_applications ?? 0)),
		[districts]
	)
	const maxSubdivisionTotal = useMemo(() => {
		let max = 0
		const source = lockToDistrict && focusDistrictName
			? districts.filter(
					(d) => normalizeLoose(d.name) === normalizeLoose(focusDistrictName)
				)
			: districts
		source.forEach((d) => {
			;(d.subdivisions || []).forEach((s) => {
				max = Math.max(max, s.total_applications ?? 0)
			})
		})
		return max
	}, [districts, lockToDistrict, focusDistrictName])

	const lockedName = lockToDistrict ? focusDistrictName : null

	const isLockedDistrict = useCallback(
		(label) => {
			if (!lockedName) return false
			return normalizeLoose(label) === normalizeLoose(lockedName)
		},
		[lockedName]
	)

	/** District admin: only this district’s polygon — no other Assam boundaries. */
	const displayGeojson = useMemo(() => {
		if (!geojson?.features) return geojson
		if (!lockToDistrict || !focusDistrictName) return geojson
		const features = geojson.features.filter((f) =>
			geoFeatureMatchesDistrictName(f, focusDistrictName)
		)
		if (!features.length) return geojson
		return { type: 'FeatureCollection', features }
	}, [geojson, lockToDistrict, focusDistrictName])

	const focusLabel =
		(viewMode === 'district' && (selected?.name || zoomTarget || focusDistrictName)) ||
		(lockToDistrict ? focusDistrictName : null)

	const districtSubdivisions = useMemo(() => {
		if (!subGeojson?.features || !focusLabel) return []
		const names = subGeojson.features
			.filter((f) => geoFeatureMatchesDistrictName(f, focusLabel))
			.map((f) => subdistrictFeatureName(f))
			.filter(Boolean)
		const unique = [...new Set(names)].sort((a, b) => a.localeCompare(b))
		return unique.map((name) => {
			const stats = findSubdivisionStats(name, subdivisionLookup)
			return {
				name,
				total_applications: stats?.total_applications ?? 0,
				tenancy_applications: stats?.tenancy_applications ?? 0,
				service_applications: stats?.service_applications ?? 0,
			}
		})
	}, [subGeojson, focusLabel, subdivisionLookup])

	const displaySubGeojson = useMemo(() => {
		if (!showSubdivisions || !subGeojson?.features || !focusLabel) return null
		const features = subGeojson.features.filter((f) =>
			geoFeatureMatchesDistrictName(f, focusLabel)
		)
		if (!features.length) return null
		return { type: 'FeatureCollection', features }
	}, [showSubdivisions, subGeojson, focusLabel])

	const districtOptions = useMemo(() => {
		const fromStats = [...districts].sort((a, b) =>
			String(a.name).localeCompare(String(b.name))
		)
		if (lockToDistrict && focusDistrictName) {
			const own =
				fromStats.find((d) => normalizeLoose(d.name) === normalizeLoose(focusDistrictName)) ||
				{ name: focusDistrictName }
			return [own]
		}
		if (fromStats.length) return fromStats
		if (!geojson?.features) return []
		return geojson.features
			.map((f) => ({
				id: f.properties?.dt_code || f.properties?.district,
				name: f.properties?.district,
			}))
			.filter((d) => d.name)
			.sort((a, b) => a.name.localeCompare(b.name))
	}, [districts, geojson, lockToDistrict, focusDistrictName])

	const selectDistrict = useCallback(
		(district, geoLabel) => {
			const label = district?.name || geoLabel
			if (lockedName && !isLockedDistrict(label)) return
			setSelected(district || { name: label })
			setZoomTarget(label)
			setViewMode('district')
			setActiveSubdistrict(null)
			if (district) onDistrictSelect?.(district)
		},
		[onDistrictSelect, lockedName, isLockedDistrict]
	)

	const showAllAssam = () => {
		if (lockToDistrict) return
		setViewMode('state')
		setZoomTarget(null)
		setSelected(null)
		setActiveSubdistrict(null)
	}

	const resetMapView = () => {
		if (!lockToDistrict) {
			setViewMode('state')
			setZoomTarget(null)
			setSelected(null)
			setActiveSubdistrict(null)
		}
		// Always re-fit to the default size (undoes manual +/- zoom)
		setFitNonce((n) => n + 1)
	}

	const styleFeature = (feature) => {
		const district = findDistrictForGeoFeature(feature, lookup)
		const geoName = feature.properties?.district || ''
		const label = district?.name || geoName
		const total = district?.total_applications ?? 0
		const isActive =
			lockToDistrict ||
			(selected && normalizeLoose(selected.name || selected) === normalizeLoose(label))
		const subsVisible = Boolean(displaySubGeojson)

		// When sub-divisions are on, hide the district stroke so edges don't double-draw
		// (district polygons are dissolved from the same LGD sub-division source).
		if (subsVisible) {
			return {
				fillColor: isActive
					? lockToDistrict
						? '#166534'
						: '#1e3a8a'
					: fillForVolume(total, maxTotal),
				weight: 0,
				color: '#0f172a',
				fillOpacity: isActive ? 0.14 : 0.1,
				opacity: 0,
			}
		}

		return {
			fillColor: isActive
				? lockToDistrict
					? '#166534'
					: '#1e3a8a'
				: fillForVolume(total, maxTotal),
			weight: isActive ? 2.25 : 1.1,
			color: isActive ? (lockToDistrict ? '#14532d' : '#0f172a') : '#475569',
			fillOpacity: isActive ? 0.88 : 0.85,
			opacity: 1,
		}
	}

	const styleSubFeature = (feature) => {
		const name = subdistrictFeatureName(feature)
		const stats = findSubdivisionStats(feature, subdivisionLookup)
		const total = stats?.total_applications ?? 0
		const isActive = activeSubdistrict && normalizeLoose(activeSubdistrict) === normalizeLoose(name)
		const fill = isActive
			? `url(#${SUB_FOCUS_HATCH_ID})`
			: total > 0
				? fillForVolume(total, maxSubdivisionTotal || 1)
				: '#fff7ed'
		return {
			fillColor: fill,
			fillOpacity: isActive ? 1 : total > 0 ? 0.45 : 0.22,
			weight: isActive ? 3.25 : 1.1,
			color: isActive ? '#7c2d12' : '#9a3412',
			opacity: 1,
			dashArray: isActive ? '6 4' : null,
			className: isActive ? 'ws-assam-sub-focus' : '',
		}
	}

	const onEachFeature = (feature, layer) => {
		const district = findDistrictForGeoFeature(feature, lookup)
		const geoName = feature.properties?.district || 'District'
		const label = district?.name || geoName
		const total = district?.total_applications ?? 0
		const uin = district?.tenancy_applications ?? 0
		const forms = district?.service_applications ?? 0
		const users = district?.users_count ?? 0

		layer.bindTooltip(
			`<div class="ws-assam-tip">
				<strong>${label}</strong>
				<span>${total} apps · ${uin} UIN · ${forms} forms · ${users} users</span>
			</div>`,
			{ sticky: false, className: 'ws-assam-map-tooltip', direction: 'top', opacity: 1 }
		)

		if (lockToDistrict) return

		layer.on({
			mouseover: (e) => {
				e.target.setStyle({ weight: 2.5, color: '#0f172a' })
				e.target.bringToFront()
			},
			mouseout: (e) => {
				e.target.setStyle(styleFeature(feature))
			},
			click: () => {
				selectDistrict(district, label)
			},
		})
	}

	const onEachSubFeature = (feature, layer) => {
		const name = subdistrictFeatureName(feature)
		const parent = feature.properties?.district || focusLabel || 'District'
		const stats = findSubdivisionStats(feature, subdivisionLookup)
		const total = stats?.total_applications ?? 0
		const uin = stats?.tenancy_applications ?? 0
		const forms = stats?.service_applications ?? 0
		const appsLabel =
			total === 1 ? '1 application' : `${total.toLocaleString('en-IN')} applications`

		layer.bindTooltip(
			`<div class="ws-assam-tip">
				<strong>${name}</strong>
				<span>${appsLabel} from this sub-division</span>
				<span class="ws-assam-tip-sub">${uin.toLocaleString('en-IN')} UIN · ${forms.toLocaleString('en-IN')} forms · ${parent}</span>
			</div>`,
			{ sticky: false, className: 'ws-assam-map-tooltip', direction: 'top', opacity: 1 }
		)
		layer.on({
			mouseover: (e) => {
				const base = styleSubFeature(feature)
				e.target.setStyle({
					...base,
					weight: (base.weight || 1.1) + 0.5,
					fillOpacity: Math.min(1, (base.fillOpacity ?? 0.45) + 0.12),
				})
				e.target.bringToFront()
			},
			mouseout: (e) => {
				e.target.setStyle(styleSubFeature(feature))
			},
			click: (e) => {
				L.DomEvent.stopPropagation(e)
				setActiveSubdistrict(name)
			},
		})
	}

	const districtLabelForFeature = useCallback(
		(feature) => {
			const district = findDistrictForGeoFeature(feature, lookup)
			return district?.name || feature.properties?.district || ''
		},
		[lookup]
	)

	const subLabelForFeature = useCallback((feature) => subdistrictFeatureName(feature), [])

	if (loadError) {
		return (
			<div className="ws-map-panel">
				<p className="ws-chart-empty ws-activity-empty--error">{loadError}</p>
			</div>
		)
	}

	if (!geojson) {
		return (
			<div className="ws-map-panel">
				<p className="ws-chart-empty">Loading Assam map…</p>
			</div>
		)
	}

	const selectedLabel = selected?.name || (lockToDistrict ? focusDistrictName : null)
	const panelClass = [
		'ws-map-panel',
		'ws-assam-map-panel',
		fillContainer ? 'ws-assam-map-panel--fill' : '',
		lockToDistrict ? 'ws-assam-map-panel--locked' : '',
	]
		.filter(Boolean)
		.join(' ')

	return (
		<div className={panelClass}>
			{hint ? <p className="ws-dashboard-hint ws-map-hint">{hint}</p> : null}

			{!lockToDistrict ? (
				<div className="ws-assam-map-toolbar">
					<label className="ws-assam-map-jump">
						<span>Jump to district</span>
						<select
							className="ws-assam-map-select"
							value={viewMode === 'district' ? selectedLabel || '' : ''}
							onChange={(e) => {
								const name = e.target.value
								if (!name) {
									showAllAssam()
									return
								}
								const d = districtOptions.find(
									(item) => normalizeLoose(item.name) === normalizeLoose(name)
								)
								selectDistrict(d || { name }, name)
							}}
						>
							<option value="">All Assam</option>
							{districtOptions.map((d) => (
								<option key={d.id || d.name} value={d.name}>
									{d.name}
								</option>
							))}
						</select>
					</label>
					{viewMode === 'district' && showSubdivisions && districtSubdivisions.length ? (
						<label className="ws-assam-map-jump">
							<span>Jump to sub-division</span>
							<select
								className="ws-assam-map-select"
								value={activeSubdistrict || ''}
								onChange={(e) => {
									const name = e.target.value
									setActiveSubdistrict(name || null)
									if (!name) setFitNonce((n) => n + 1)
								}}
							>
								<option value="">All in district</option>
								{districtSubdivisions.map((sub) => (
									<option key={sub.name} value={sub.name}>
										{sub.name}
										{sub.total_applications
											? ` (${sub.total_applications})`
											: ''}
									</option>
								))}
							</select>
						</label>
					) : null}
					<div className="ws-assam-map-toolbar-actions">
						{viewMode === 'district' && subGeojson ? (
							<label className="ws-assam-map-toggle">
								<input
									type="checkbox"
									checked={showSubdivisions}
									onChange={(e) => {
										setShowSubdivisions(e.target.checked)
										if (!e.target.checked) setActiveSubdistrict(null)
									}}
								/>
								<span>Show sub-divisions</span>
							</label>
						) : null}
						<button
							type="button"
							className="ws-btn ws-btn--sm ws-btn--outline"
							onClick={resetMapView}
							title="Return map to the default size"
						>
							Reset view
						</button>
						{viewMode !== 'district' ? (
							<span className="ws-assam-map-toolbar-hint">
								Select a district, then pick a sub-division
							</span>
						) : null}
					</div>
				</div>
			) : (
				<div className="ws-assam-map-toolbar ws-assam-map-toolbar--locked">
					<p className="ws-assam-map-locked-badge">
						District boundary · <strong>{focusDistrictName || 'your district'}</strong>
					</p>
					{showSubdivisions && districtSubdivisions.length ? (
						<label className="ws-assam-map-jump">
							<span>Jump to sub-division</span>
							<select
								className="ws-assam-map-select"
								value={activeSubdistrict || ''}
								onChange={(e) => {
									const name = e.target.value
									setActiveSubdistrict(name || null)
									if (!name) setFitNonce((n) => n + 1)
								}}
							>
								<option value="">All in district</option>
								{districtSubdivisions.map((sub) => (
									<option key={sub.name} value={sub.name}>
										{sub.name}
										{sub.total_applications
											? ` (${sub.total_applications})`
											: ''}
									</option>
								))}
							</select>
						</label>
					) : null}
					<div className="ws-assam-map-toolbar-actions">
						{subGeojson ? (
							<label className="ws-assam-map-toggle">
								<input
									type="checkbox"
									checked={showSubdivisions}
									onChange={(e) => {
										setShowSubdivisions(e.target.checked)
										if (!e.target.checked) setActiveSubdistrict(null)
									}}
								/>
								<span>Show sub-divisions</span>
							</label>
						) : null}
						<button
							type="button"
							className="ws-btn ws-btn--sm ws-btn--outline"
							onClick={resetMapView}
							title="Return map to the default size"
						>
							Reset view
						</button>
						<span className="ws-assam-map-toolbar-hint">
							Only your district outline is shown
						</span>
					</div>
				</div>
			)}

			<div className="ws-assam-map-layout">
				<div className="ws-assam-map-frame">
					<MapContainer
						center={ASSAM_MAP_CENTER}
						zoom={ASSAM_MAP_ZOOM}
						minZoom={6}
						maxZoom={14}
						zoomSnap={0}
						zoomDelta={1}
						scrollWheelZoom={false}
						dragging
						doubleClickZoom
						boxZoom={false}
						keyboard={false}
						touchZoom
						zoomControl={false}
						attributionControl={false}
						trackResize={false}
						className="ws-assam-map"
					>
						<SubdistrictPane />
						<SubdistrictHatchPattern />
						<GeoJSON
							key={`assam-${selectedLabel || 'state'}-${lockToDistrict ? 'district-only' : 'open'}-${maxTotal}-${displaySubGeojson ? 'subs' : 'plain'}`}
							data={displayGeojson}
							style={styleFeature}
							onEachFeature={onEachFeature}
						/>
						{displaySubGeojson ? (
							<GeoJSON
								key={`subs-${selectedLabel || focusDistrictName || 'none'}-${activeSubdistrict || 'none'}-${districtSubdivisions.length}-${maxSubdivisionTotal}`}
								data={displaySubGeojson}
								style={styleSubFeature}
								onEachFeature={onEachSubFeature}
								pane="subdistricts"
							/>
						) : null}
						{displaySubGeojson ? (
							<PlaceLabels
								key={`sub-labels-${selectedLabel || focusDistrictName || 'none'}-${districtSubdivisions.length}`}
								geojson={displaySubGeojson}
								getLabel={subLabelForFeature}
								variant="subdistrict"
							/>
						) : (
							<PlaceLabels
								key={`district-labels-${selectedLabel || 'state'}-${lockToDistrict ? 'locked' : 'open'}`}
								geojson={displayGeojson}
								getLabel={districtLabelForFeature}
								variant={viewMode === 'district' || lockToDistrict ? 'district-focus' : 'district'}
							/>
						)}
						<MapResizeSync
							geojson={displayGeojson}
							zoomTargetName={zoomTarget}
							viewMode={viewMode}
							padX={lockToDistrict ? 36 : fillContainer ? 14 : 16}
							padY={lockToDistrict ? 36 : fillContainer ? 14 : 16}
							singleDistrict={lockToDistrict}
							fillContainer={fillContainer}
							fitNonce={fitNonce}
						/>
						{displaySubGeojson ? (
							<SubdistrictFocusSync
								geojson={displaySubGeojson}
								activeName={activeSubdistrict}
								enabled={Boolean(activeSubdistrict)}
							/>
						) : null}
						<MapZoomControls />
					</MapContainer>
				</div>

				<aside className="ws-assam-map-info" aria-live="polite">
					{selected || (lockToDistrict && focusDistrictName) ? (
						<>
							<p className="ws-assam-map-info-kicker">
								{lockToDistrict ? 'Your district' : 'Selected district'}
							</p>
							<h3 className="ws-assam-map-info-title">
								{selected?.name || focusDistrictName}
							</h3>
							{selected?.state_name ? (
								<p className="ws-assam-map-info-meta">{selected.state_name}</p>
							) : (
								<p className="ws-assam-map-info-meta">Assam</p>
							)}
							<dl className="ws-assam-map-info-stats">
								<div>
									<dt>Total applications</dt>
									<dd>{(selected?.total_applications ?? 0).toLocaleString('en-IN')}</dd>
								</div>
								<div>
									<dt>UIN / Tenancy</dt>
									<dd>{(selected?.tenancy_applications ?? 0).toLocaleString('en-IN')}</dd>
								</div>
								<div>
									<dt>Service forms</dt>
									<dd>{(selected?.service_applications ?? 0).toLocaleString('en-IN')}</dd>
								</div>
								<div>
									<dt>Users</dt>
									<dd>{(selected?.users_count ?? 0).toLocaleString('en-IN')}</dd>
								</div>
								{selected?.offices_count != null ? (
									<div>
										<dt>Offices</dt>
										<dd>{selected.offices_count.toLocaleString('en-IN')}</dd>
									</div>
								) : null}
								{selected?.code ? (
									<div>
										<dt>District code</dt>
										<dd>{selected.code}</dd>
									</div>
								) : null}
								{districtSubdivisions.length ? (
									<div>
										<dt>Sub-divisions</dt>
										<dd>{districtSubdivisions.length}</dd>
									</div>
								) : null}
							</dl>
							{showSubdivisions && districtSubdivisions.length ? (
								<div className="ws-assam-map-subs">
									<p className="ws-assam-map-subs-title">
										{activeSubdistrict
											? `Selected: ${activeSubdistrict}`
											: 'Sub-divisions in this district'}
									</p>
									<ul className="ws-assam-map-subs-list">
										{districtSubdivisions.map((sub) => (
											<li key={sub.name}>
												<button
													type="button"
													className={
														activeSubdistrict &&
														normalizeLoose(activeSubdistrict) ===
															normalizeLoose(sub.name)
															? 'is-active'
															: undefined
													}
													onClick={() => setActiveSubdistrict(sub.name)}
												>
													<span className="ws-assam-map-subs-name">{sub.name}</span>
													<span className="ws-assam-map-subs-count">
														{(sub.total_applications ?? 0).toLocaleString('en-IN')}
													</span>
												</button>
											</li>
										))}
									</ul>
									<p className="ws-assam-map-subs-note">
										Totals include UIN and service forms linked to each circle
										office (forms via the related tenancy UIN).
									</p>
								</div>
							) : null}
							<div className="ws-assam-map-legend" aria-hidden>
								<span className="ws-assam-map-legend-label">Application volume</span>
								<span className="ws-assam-map-legend-scale">
									<span className="is-none" />
									<span className="is-low" />
									<span className="is-mid" />
									<span className="is-high" />
								</span>
								<span className="ws-assam-map-legend-ends">
									<span>None</span>
									<span>High</span>
								</span>
							</div>
							{!lockToDistrict && viewMode === 'district' ? (
								<button
									type="button"
									className="ws-btn ws-btn--sm ws-btn--outline"
									onClick={resetMapView}
								>
									Reset view
								</button>
							) : null}
						</>
					) : (
						<>
							<p className="ws-assam-map-info-kicker">Statewide view</p>
							<h3 className="ws-assam-map-info-title">Assam</h3>
							<p className="ws-assam-map-info-meta">
								Pick a district to zoom in, see sub-divisions, and view its stats.
							</p>
							<div className="ws-assam-map-legend" aria-hidden>
								<span className="ws-assam-map-legend-label">Application volume</span>
								<span className="ws-assam-map-legend-scale">
									<span className="is-none" />
									<span className="is-low" />
									<span className="is-mid" />
									<span className="is-high" />
								</span>
								<span className="ws-assam-map-legend-ends">
									<span>None</span>
									<span>High</span>
								</span>
							</div>
						</>
					)}
				</aside>
			</div>
		</div>
	)
}

function normalizeLoose(name) {
	return String(name || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
}

export default AssamDistrictMap
