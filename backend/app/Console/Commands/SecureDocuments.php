<?php

namespace App\Console\Commands;

use App\Support\DocumentStore;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Move uploaded files off the web-served `public` disk and onto the private `documents` disk.
 *
 * Everything written before 8 September 2026 - passport photographs, signatures, PAN cards,
 * agreements, the signature on every service form - is on public/storage and readable by anyone
 * who knows or guesses the path. Making the code write somewhere private does nothing for those;
 * this moves them, keeping the relative path identical so no database column has to change.
 *
 * DocumentStore reads through to the old disk, so the application works whether or not this has
 * run. Running it is what actually closes the exposure.
 *
 * Safe to run repeatedly, and safe to run while the site is up: each file is copied first and only
 * unlinked once the copy is verified, and DocumentStore prefers the private disk, so a file is
 * readable from one place or the other at every instant.
 */
class SecureDocuments extends Command
{
    protected $signature = 'documents:secure
                            {--dry-run : List what would move and change nothing}
                            {--keep : Copy to the private disk but leave the public copy in place}';

    protected $description = 'Move uploaded tenancy documents from the public disk to the private documents disk';

    /**
     * Only these. storage/app/public may hold other things - anything not written by DocumentStore
     * is none of this command's business.
     */
    private const DIRECTORIES = [
        'tenancy',
        'profile-photos',
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $keep = (bool) $this->option('keep');

        $public = Storage::disk(DocumentStore::LEGACY_DISK);
        $private = Storage::disk(DocumentStore::DISK);

        $moved = 0;
        $skipped = 0;
        $failed = 0;
        $bytes = 0;

        foreach (self::DIRECTORIES as $directory) {
            if (!$public->exists($directory)) {
                continue;
            }

            foreach ($public->allFiles($directory) as $path) {
                if ($private->exists($path)) {
                    // Already secured. Clear the public copy unless asked not to: leaving it is
                    // leaving the exposure.
                    if (!$keep && !$dryRun) {
                        $public->delete($path);
                    }
                    $skipped++;
                    continue;
                }

                if ($dryRun) {
                    $this->line('  would move  ' . $path);
                    $moved++;
                    continue;
                }

                $contents = $public->get($path);
                if ($contents === null) {
                    $this->warn('  unreadable  ' . $path);
                    $failed++;
                    continue;
                }

                if (!$private->put($path, $contents)) {
                    $this->error('  failed      ' . $path);
                    $failed++;
                    continue;
                }

                // Verify before unlinking. A short write here would destroy the only copy of
                // somebody's PAN card.
                if ($private->size($path) !== strlen($contents)) {
                    $this->error('  size mismatch, left in place  ' . $path);
                    $private->delete($path);
                    $failed++;
                    continue;
                }

                if (!$keep) {
                    $public->delete($path);
                }

                $bytes += strlen($contents);
                $moved++;
            }
        }

        $this->newLine();
        $this->info(sprintf(
            '%s %d file(s)%s; %d already secured; %d failed.',
            $dryRun ? 'Would move' : ($keep ? 'Copied' : 'Moved'),
            $moved,
            $bytes ? sprintf(' (%.1f MB)', $bytes / 1048576) : '',
            $skipped,
            $failed
        ));

        if (!$dryRun && $keep) {
            $this->warn('--keep leaves the public copies readable at /storage/<path>. Re-run without it to finish.');
        }

        return $failed === 0 ? self::SUCCESS : self::FAILURE;
    }
}
