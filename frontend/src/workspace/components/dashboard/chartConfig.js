import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Tooltip,
	Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

export const STATUS_CHART_COLORS = {
	SUBMITTED: '#2563eb',
	IN_REVIEW: '#d97706',
	REJECTED: '#dc2626',
	COMPLETED: '#16a34a',
	APPROVED: '#15803d',
	VALUER_ASSIGNED: '#0891b2',
	VALUER_REPORT_SUBMITTED: '#7c3aed',
	OTHER: '#94a3b8',
	DRAFT: '#8b5cf6',
	PARTIAL: '#0d9488',
}

export const STATUS_CHART_LABELS = {
	SUBMITTED: 'Submitted',
	IN_REVIEW: 'In review',
	REJECTED: 'Rejected',
	COMPLETED: 'Completed',
	APPROVED: 'Approved',
	VALUER_ASSIGNED: 'Assigned to valuer',
	VALUER_REPORT_SUBMITTED: 'Valuer report',
	OTHER: 'Other',
	DRAFT: 'Draft',
	PARTIAL: 'Awaiting party',
}

export const barChartOptions = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: { legend: { display: false } },
	scales: {
		y: {
			beginAtZero: true,
			ticks: { precision: 0 },
			grid: { color: 'rgba(148, 163, 184, 0.25)' },
		},
		x: { grid: { display: false } },
	},
}

/** Static bar chart — no grow/resize animation */
export const staticBarChartOptions = {
	...barChartOptions,
	animation: false,
	transitions: {
		active: { animation: { duration: 0 } },
		resize: { animation: { duration: 0 } },
		show: { animation: { duration: 0 } },
		hide: { animation: { duration: 0 } },
	},
}

export const doughnutChartOptions = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			position: 'bottom',
			labels: { boxWidth: 12, padding: 12, font: { size: 11 } },
		},
	},
}
