import dataGovLogo from '../assets/img/data.gov.in.svg'
import digitalIndiaLogo from '../assets/img/digital-india.png'
import indiaPortalLogo from '../assets/img/india-portal.jpg'
import mygovLogo from '../assets/img/mygov.svg'
import nicLogo from '../assets/img/NIC.png'
import pmIndiaLogo from '../assets/img/PMindia.png'
import tcpAssamLogo from '../assets/img/TCP logo.png'

/** Official portal links — add logo images under assets/img/gov/ when available */
export const governmentPortalLogos = [
	{
		id: 'digital-india',
		name: 'Digital India',
		href: 'https://www.digitalindia.gov.in/',
		logo: digitalIndiaLogo,
		alt: 'Digital India',
	},
	{
		id: 'nic',
		name: 'NIC',
		href: 'https://www.nic.in/',
		logo: nicLogo,
		alt: 'National Informatics Centre',
	},
	{
		id: 'india-gov',
		name: 'India.gov.in',
		href: 'https://www.india.gov.in/',
		logo: indiaPortalLogo,
		alt: 'National Portal of India',
	},
	{
		id: 'tcp-assam',
		name: 'TCP Assam',
		href: 'https://tcp.assam.gov.in/',
		logo: tcpAssamLogo,
		alt: 'Directorate of Town and Country Planning, Assam',
	},
	{
		id: 'mygov',
		name: 'MyGov',
		href: 'https://www.mygov.in/',
		logo: mygovLogo,
		alt: 'MyGov India',
	},
	{
		id: 'pm-india',
		name: 'PM India',
		href: 'https://www.pmindia.gov.in/',
		logo: pmIndiaLogo,
		alt: 'Prime Minister of India',
		imgClass: 'gov-logos-carousel__img--pm',
	},
	{
		id: 'data-gov',
		name: 'Data.gov.in',
		href: 'https://data.gov.in/',
		logo: dataGovLogo,
		alt: 'Open Government Data Platform India',
	},
]
