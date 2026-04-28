<?php

namespace Database\Seeders;

use App\Models\BingoCard;
use App\Models\BingoCardCell;
use Illuminate\Database\Seeder;

class BingoSeeder extends Seeder
{
    public function run(): void
    {
        $card = BingoCard::create([
            'title' => 'Data Privacy Bingo',
            'description' => 'Are you guilty of these common data privacy mistakes?',
            'is_active' => true,
            'time_limit_seconds' => 120, // 2 minutes
            'starts_at' => now(),
            'ends_at' => now()->addMinutes(2),
        ]);

        $habits = [
            ['label' => 'Used "password123"', 'weight' => 3],
            ['label' => 'Shared OTP with someone', 'weight' => 3],
            ['label' => 'Clicked a suspicious link', 'weight' => 3],
            ['label' => 'No lock screen on phone', 'weight' => 3],
            ['label' => 'Public Wi-Fi without VPN', 'weight' => 2],
            
            ['label' => 'Ignored software update', 'weight' => 2],
            ['label' => 'Reused password for bank', 'weight' => 3],
            ['label' => 'Wrote password on sticky note', 'weight' => 2],
            ['label' => 'Accepted all cookies blindly', 'weight' => 1],
            ['label' => 'Saved card on shopping site', 'weight' => 2],
            
            ['label' => 'Posted boarding pass online', 'weight' => 2],
            ['label' => 'Overshared on social media', 'weight' => 1],
            ['label' => 'FREE SPACE (Privacy Pro)', 'weight' => 0],
            ['label' => 'Left laptop unlocked', 'weight' => 2],
            ['label' => 'Used work email for personal', 'weight' => 1],
            
            ['label' => 'Skipped 2FA setup', 'weight' => 3],
            ['label' => 'Downloaded cracked software', 'weight' => 3],
            ['label' => 'Logged in on public computer', 'weight' => 3],
            ['label' => 'No antivirus installed', 'weight' => 2],
            ['label' => 'Answered phishing call', 'weight' => 3],
            
            ['label' => 'Gave app camera access', 'weight' => 1],
            ['label' => 'Gave app location access', 'weight' => 1],
            ['label' => 'Bought from unsecure site', 'weight' => 3],
            ['label' => 'Ignored data breach alert', 'weight' => 3],
            ['label' => 'Shared passwords via chat', 'weight' => 3],
        ];

        $index = 0;
        for ($row = 0; $row < 5; $row++) {
            for ($col = 0; $col < 5; $col++) {
                BingoCardCell::create([
                    'bingo_card_id' => $card->id,
                    'row_index' => $row,
                    'col_index' => $col,
                    'label' => $habits[$index]['label'],
                    'risk_weight' => $habits[$index]['weight'],
                ]);
                $index++;
            }
        }
    }
}
