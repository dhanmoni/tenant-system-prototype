@extends('notices.layout')

@section('masthead')
    @include('notices._masthead', [
        'preTitle' => 'PROCEEDING SHEET / MINUTES OF JOINT DISCUSSION',
    ])
@endsection

@section('body')
    <div class="bold" style="margin-bottom: 10px;">RECORD OF PROCEEDING</div>
    <p class="para">The tenancy dispute between the following parties was taken up for hearing/joint
        discussion:</p>

    <div class="block">
        <div class="bold">Applicant/Petitioner</div>
        <div>{{ $applicantName }}</div>
        <div style="margin: 12px 0;">-Versus-</div>
        <div class="bold">Respondent/Opposite Party</div>
        <div>{{ $respondentName }}</div>
    </div>

    <p class="para">before the undersigned {{ $officeName }} on {{ $hearingDate }}.</p>
    <p class="para">The following persons appeared:</p>

    <table class="appearances">
        <thead>
            <tr>
                <th>Sl. No.</th>
                <th>Name</th>
                <th>Status</th>
                <th>Mode of Appearance</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>1</td>
                <td>{{ $applicantName }}</td>
                <td>Applicant</td>
                <td>Physical</td>
            </tr>
            <tr>
                <td>2</td>
                <td>{{ $respondentName }}</td>
                <td>Respondent</td>
                <td>Physical</td>
            </tr>
        </tbody>
    </table>

    <p class="para">Both parties were given an opportunity to be heard, and their respective
        submissions were heard and taken on record.</p>
    <p class="para">During the hearing and joint discussion/mediation, the following facts and
        circumstances emerged from the records and submissions:</p>

    <div class="verbatim">{{ $remarks }}</div>

    <p class="para">Following the discussion, the parties voluntarily agreed to the following terms
        of settlement:</p>

    <div class="verbatim">{{ $additionalRemarks }}</div>

    <p class="para">The parties stated and confirmed that the settlement was reached voluntarily, of
        their own free will, and without coercion, undue influence, misrepresentation or
        pressure.</p>
    <p class="para">The matter is accordingly placed before the {{ $officeName }} for consideration
        and for passing an appropriate order in accordance with law.</p>
@endsection
