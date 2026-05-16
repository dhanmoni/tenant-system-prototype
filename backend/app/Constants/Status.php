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
        ];
    }
}
