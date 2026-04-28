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
        Schema::create('bingo_card_cells', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bingo_card_id')->constrained()->cascadeOnDelete();
            $table->integer('row_index');
            $table->integer('col_index');
            $table->string('label');
            $table->text('description')->nullable();
            $table->integer('risk_weight')->default(1);
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bingo_card_cells');
    }
};
