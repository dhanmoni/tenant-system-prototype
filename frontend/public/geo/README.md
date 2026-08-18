/**
 * Assam map boundaries (prototype)
 *
 * Aligned to the current **35 Assam districts** used in `DistrictSeeder`
 * (includes Bajali and Tamulpur). Sub-district `district` names were
 * canonicalised to portal names (Kamrup Rural, Kamrup Metropolitan,
 * Morigaon, South Salmara-Mankachar).
 *
 * ## Districts — assam-districts.geojson
 * Source: Dissolved from assam-subdistricts.geojson (LGD sub-districts), so district
 *         outlines align with sub-division overlays.
 * Format: GeoJSON FeatureCollection, WGS84 (EPSG:4326)
 * Fields: district, dt_code, st_code, st_nm, dist_lgd, year, source
 * Features: 35 (matches portal master data)
 * Legacy (older india-maps-data vintage): assam-districts.legacy.geojson
 *
 * ## Sub-districts / circles — assam-subdistricts.geojson
 * Source: LGD Subdistricts (india-geodata / Bharatmaps LGD), filtered to Assam and simplified.
 * Format: GeoJSON FeatureCollection, WGS84 (EPSG:4326)
 * Fields: district, subdistrict, dt_code, sdt_code, dist_lgd, subdt_lgd, st_nm
 * Notes: These are LGD sub-district (revenue circle) polygons, not civil SDO HQ points.
 *         172 features across 35 districts.
 *
 * For production, replace with Survey of India / Assam state GIS / LGD-approved boundaries.
 */
