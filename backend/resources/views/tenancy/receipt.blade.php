<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Tenancy Receipt - {{ $application->application_no }}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #0f172a;
        margin: 24px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 20px;
      }
      .muted {
        color: #64748b;
        font-size: 12px;
      }
      .section {
        margin-top: 18px;
        padding-top: 12px;
        border-top: 1px solid #e2e8f0;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px 16px;
        font-size: 13px;
      }
      .label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #64748b;
        font-weight: 700;
      }
      .value {
        display: block;
        font-weight: 600;
      }
      @media print {
        body {
          margin: 0;
        }
      }
    </style>
  </head>
  <body>
    <h1>Acknowledgment Receipt</h1>
    <div class="muted">Application No: {{ $application->application_no }}</div>
    <div class="muted">
      Submitted At:
      {{ optional($application->created_at)->copy()->timezone('Asia/Kolkata')->format('d M Y, h:i:s A') }}
    </div>

    <div class="section">
      <div class="grid">
        <div>
          <span class="label">Applicant Name</span>
          <span class="value">{{ $application->tenant_name }}</span>
        </div>
        <div>
          <span class="label">Office Applied To</span>
          <span class="value">{{ optional($application->office)->name ?? 'N/A' }}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="grid">
        <div>
          <span class="label">Registration Date</span>
          <span class="value">{{ $application->registration_date }}</span>
        </div>
        <div>
          <span class="label">Apply Type</span>
          <span class="value">{{ $application->apply_type }}</span>
        </div>
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
