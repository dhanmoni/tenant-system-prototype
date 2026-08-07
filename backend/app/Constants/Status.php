<?php

namespace App\Constants;

class Status
{
    public const SUBMITTED = 'SUBMITTED';
    public const IN_REVIEW = 'IN_REVIEW';
    public const REJECTED = 'REJECTED';
    public const APPROVED = 'APPROVED';
    public const UNDER_PROCESS = 'UNDER_PROCESS';
    public const COMPLETED = 'COMPLETED';
    public const PARTIAL = 'PARTIAL';
    public const PENDING = 'PENDING';
    public const DRAFT = 'DRAFT';
    public const WITHDRAWN = 'WITHDRAWN';
    public const VALUER_ASSIGNED = 'VALUER_ASSIGNED';
    public const VALUER_REPORT_SUBMITTED = 'VALUER_REPORT_SUBMITTED';

    /**
     * Get all valid statuses.
     */
    public static function all(): array
    {
        return [
            self::SUBMITTED,
            self::IN_REVIEW,
            self::REJECTED,
            self::APPROVED,
            self::UNDER_PROCESS,
            self::COMPLETED,
            self::PARTIAL,
            self::PENDING,
            self::DRAFT,
            self::WITHDRAWN,
            self::VALUER_ASSIGNED,
            self::VALUER_REPORT_SUBMITTED,
        ];
    }
}
