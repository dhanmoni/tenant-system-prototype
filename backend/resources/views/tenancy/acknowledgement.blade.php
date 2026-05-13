<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Tenancy_Acknowledgement_{{ $application->application_no }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 15mm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #000;
            line-height: 1.3;
            margin: 0 auto;
            padding: 0;
            font-size: 13px;
            max-width: 800px;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        .emblem {
            width: 65px;
            height: auto;
            margin-bottom: 5px;
        }
        .gov-title {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
        }
        .dept-title {
            font-size: 13px;
            margin: 4px 0;
        }
        .cert-type {
            font-size: 15px;
            font-weight: bold;
            margin-top: 10px;
            text-decoration: underline;
        }
        .content {
            margin-bottom: 15px;
        }
        .app-no {
            font-weight: bold;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .details-table th, .details-table td {
            text-align: left;
            padding: 8px 5px;
            border-bottom: 1px dashed #ccc;
        }
        .details-table th {
            width: 40%;
            font-weight: bold;
            color: #333;
        }
        .timestamp {
            margin-top: 30px;
            font-size: 11px;
            color: #555;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        @php
            $emblemPath = public_path('emblem-dark.png');
            $emblemData = file_exists($emblemPath) ? base64_encode(file_get_contents($emblemPath)) : '';
            $emblemSrc = $emblemData ? 'data:image/png;base64,' . $emblemData : '';
        @endphp
        @if($emblemSrc)
            <img src="{{ $emblemSrc }}" alt="Government Emblem" class="emblem">
        @endif
        <p class="gov-title">Government of Assam</p>
        <p class="dept-title">Department of Housing And Urban Affairs</p>
        <p class="cert-type">ACKNOWLEDGEMENT RECEIPT</p>
    </div>

    <div class="content">
        <p>This is to acknowledge the receipt of an application for UIN of Tenancy Certificate under the <strong>Assam Tenancy Act, 2021</strong>.</p>
        
        <table class="details-table">
            <tr>
                <th>Application Number</th>
                <td class="app-no">{{ $application->application_no }}</td>
            </tr>
            <tr>
                <th>UIN</th>
                <td class="app-no">{{ $application->uid ?? '' }}</td>
            </tr>
            <tr>
                <th>Date of Submission</th>
                <td>{{ optional($application->created_at)->copy()->timezone('Asia/Kolkata')->format('d F Y, h:i A') }}</td>
            </tr>
            <tr>
                <th>Landlord Name</th>
                <td>{{ $application->landlord_name }}</td>
            </tr>
            <tr>
                <th>Tenant Name</th>
                <td>{{ $application->tenant_name }}</td>
            </tr>
            <tr>
                <th>Office Applied To</th>
                <td>{{ optional($application->office)->name ?? 'N/A' }}</td>
            </tr>
            <tr>
                <th>Property Description</th>
                <td>{{ $application->property_premises_description }}</td>
            </tr>
            <tr>
                <th>Monthly Rent</th>
                <td>₹{{ $application->property_rent_payable }}</td>
            </tr>
            <tr>
                <th>Tenancy Start Date</th>
                <td>{{ $application->property_possession_date ? date('d F Y', strtotime($application->property_possession_date)) : 'N/A' }}</td>
            </tr>
            <tr>
                <th>Tenancy Duration</th>
                <td>{{ $application->property_tenancy_duration ?: 'N/A' }}</td>
            </tr>
        </table>
    </div>

    <p style="font-size: 13px; margin-top: 40px; color: #555;">
        Note: This is a computer-generated acknowledgement. No physical signature is required. The application is subject to verification by the concerned Rent Authority.
    </p>

    <div class="timestamp">
        Generated on: {{ now()->timezone('Asia/Kolkata')->format('d/m/Y H:i:s') }}
    </div>

    @if ($print)
      <script>
        window.addEventListener('load', () => {
          window.print()
        })
      </script>
    @endif
</body>
</html>
