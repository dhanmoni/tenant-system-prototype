<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Acknowledgement Certificate - {{ $application->application_no }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #1e293b;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
        }
        .certificate-container {
            border: 6px solid #f1f5f9;
            padding: 20px;
            position: relative;
        }
        .certificate-border {
            border: 1px solid #0369a1;
            padding: 15px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #0369a1;
            padding-bottom: 15px;
        }
        .gov-title {
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
            color: #0369a1;
            margin: 0;
        }
        .dept-title {
            font-size: 14px;
            margin: 3px 0;
            color: #475569;
        }
        .cert-type {
            font-size: 16px;
            font-weight: bold;
            margin-top: 10px;
            color: #0f172a;
        }
        .content {
            margin-bottom: 20px;
        }
        .app-no {
            font-weight: bold;
            color: #0369a1;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .details-table th, .details-table td {
            text-align: left;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .details-table th {
            color: #64748b;
            font-size: 11px;
            text-transform: uppercase;
            width: 40%;
        }
        .details-table td {
            font-weight: 600;
            font-size: 13px;
            color: #0f172a;
        }
        .footer {
            margin-top: 40px;
            width: 100%;
        }
        .footer-left {
            float: left;
            width: 30%;
            text-align: center;
        }
        .footer-right {
            float: right;
            width: 40%;
            text-align: center;
            margin-top: 30px;
        }
        .signature-line {
            border-top: 1px solid #94a3b8;
            margin-bottom: 5px;
        }
        .timestamp {
            position: absolute;
            bottom: 10px;
            right: 15px;
            font-size: 9px;
            color: #94a3b8;
        }
        .qr-placeholder {
            width: 60px;
            height: 60px;
            border: 1px solid #e2e8f0;
            line-height: 60px;
            text-align: center;
            font-size: 8px;
            color: #cbd5e1;
            margin: 0 auto 5px;
        }
        .clear {
            clear: both;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="certificate-border">
            <div class="header">
                <p class="gov-title">Government of Assam</p>
                <p class="dept-title">Revenue & Disaster Management Department</p>
                <p class="cert-type">Acknowledgement of Tenancy Registration</p>
            </div>

            <div class="content">
                <p>This is to acknowledge the receipt of an application for registration of tenancy under the <strong>Assam Tenancy Act, 2021</strong>.</p>
                
                <table class="details-table">
                    <tr>
                        <th>Application Number</th>
                        <td class="app-no">{{ $application->application_no }}</td>
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
                        <th>Tenancy Duration / End</th>
                        <td>{{ $application->property_tenancy_duration ?: 'N/A' }}</td>
                    </tr>
                </table>
            </div>

            <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
                Note: This is a computer-generated acknowledgement. No physical signature is required. The application is subject to verification by the concerned Rent Authority.
            </p>

            <!--<div class="footer">
                <div class="footer-left">
                    <div class="qr-placeholder">DIGITAL SEAL</div>
                    <p style="font-size: 10px; margin: 0;">Verified Digital Application</p>
                </div>
                <div class="footer-right">
                    <div class="signature-line"></div>
                    <p style="font-size: 12px; font-weight: bold; margin: 0;">Rent Authority</p>
                    <p style="font-size: 10px; margin: 0;">Revenue Department, Assam</p>
                </div>
                <div class="clear"></div>
            </div>-->
        </div>
        <div class="timestamp">
            Generated on: {{ now()->timezone('Asia/Kolkata')->format('d/m/Y H:i:s') }}
        </div>
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
