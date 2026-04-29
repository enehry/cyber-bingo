# 🧮 Guilt Score (GS) Calculation

The **Guilt Score (GS)** is the primary metric used in Cyber Bingo to rank players. It combines the severity of a security habit (Risk Weight) with the speed of admission (Speed Bonus).

## 📐 The Formula

For every cell selected by a player, the system calculates a contribution to the total score:

$$GS = \sum (Risk Weight + Speed Bonus)$$

### 1. Risk Weight (Static)
A value between **0 and 9** assigned to each cell during Arena Design. 
*   **0**: Free Space (does not contribute to GS).
*   **1-3**: Low to Medium risk habits.
*   **4-9**: High risk/severe security breaches.

### 2. Speed Bonus (Dynamic)
A value between **0.0 and 1.0** that rewards faster honesty.
$$Speed Bonus = \frac{Arena Duration - Click Time}{Arena Duration}$$

*   **Arena Duration**: Total seconds allowed for the session (e.g., 300s).
*   **Click Time**: Seconds elapsed since the start of the session when the cell was toggled on.

---

## 📝 Example Calculation

### Scenario:
*   **Arena Duration**: 300 seconds (5 minutes).
*   **Cell 1**: "Same password everywhere" (**Weight: 3**).
*   **Cell 2**: "Ignored software update" (**Weight: 2**).

### Step 1: Admission
1.  Player clicks **Cell 1** at **10 seconds** into the game.
2.  Player clicks **Cell 2** at **150 seconds** (halfway mark).

### Step 2: Speed Bonus Calculation
*   **Cell 1 Bonus**: $(300 - 10) / 300 = \mathbf{0.96}$
*   **Cell 2 Bonus**: $(300 - 150) / 300 = \mathbf{0.50}$

### Step 3: Total Score
*   **Contribution 1**: $3 + 0.96 = \mathbf{3.96}$
*   **Contribution 2**: $2 + 0.50 = \mathbf{2.50}$
*   **Final GS**: $3.96 + 2.50 = \mathbf{6.46}$

---

## 🛠️ Technical Reference
The calculation logic is implemented in `GameController.php` within the `submit` method:

```php
// app/Http/Controllers/GameController.php

foreach ($cells as $cell) {
    $weight = $cell->risk_weight;
    $clickTime = $clickHistory[$cell->id] ?? $timeLimit;

    // Speed Bonus: Earlier is better (higher score)
    $speedBonus = max(0, min(1, ($timeLimit - $clickTime) / $timeLimit));

    // Formula: Weight + SpeedBonus
    $totalWeightedScore += ($weight + $speedBonus);
}
```
