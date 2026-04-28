<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bingo_card_id')->constrained()->cascadeOnDelete();
            $table->uuid('guest_id');
            $table->foreign('guest_id')->references('id')->on('guests')->cascadeOnDelete();
            $table->json('selected_cells_json');
            $table->integer('guilty_count');
            $table->integer('weighted_score');
            $table->integer('submitted_at_seconds');
            $table->integer('tie_break_score')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
