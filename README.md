
## Game Overview

This is a side-scrolling endless runner game where you control a cartoon character running along a dynamically animated road. The goal is to survive as long as possible, avoid land mines, and achieve a high score. The game features a dark-themed, animated background with changing effects, visually appealing UI, and progressive difficulty.

---

## Game Mechanics

### 1. **Player Movement**
- The player character runs automatically from left to right.
- You control the player’s jumps using the **Spacebar** or **Arrow Up** key.
- The player can only jump when on the ground (no double-jumping).

### 2. **Obstacles**
- Land mines appear from the right and move left across the road.
- If the player collides with a land mine, the game ends.
- When hit, the player shows a “hurt” animation and the mine explodes.

### 3. **Scoring**
- Your score increases over time as you survive.
- The score increments at a moderate pace (slower than before).
- Your high score is tracked and displayed after each run.

### 4. **Difficulty Progression**
- Every 500 points, the game gets harder: obstacles move faster and spawn more frequently.
- This difficulty increase is based on time survived, not just score speed.

### 5. **Background & Visuals**
- The background is a dark, animated gradient with parallax stars, clouds, and city buildings.
- Every 1000 points, the background theme and effects change (aurora, rain, extra stars, etc.), cycling every 4000 points.
- The road is visually realistic, with dashed lane lines, edges, and subtle texture.
- The player is a cartoon character with animated limbs, facial expressions, and a “hurt” state on collision.
- Land mines are visually detailed and explode when hit.

### 6. **UI & Experience**
- The start and game over popups use modern glassmorphism, glowing buttons, and smooth animations.
- The game is fully playable with keyboard controls and is visually responsive.

---

## Technologies Used

- **HTML5 Canvas**: For all game rendering, animation, and drawing (player, obstacles, background, road).
- **JavaScript (Vanilla)**: Handles game logic, animation, collision detection, scoring, and difficulty.
- **CSS3**: For styling the UI overlays, buttons, and popups with modern effects (glassmorphism, gradients, transitions).
- **No external libraries**: The game is built from scratch using only HTML, CSS, and JS.

---

## Walkthrough for New Players

1. **Starting the Game**
   - Open the game in your browser.
   - Click the glowing **Start Game** button in the center popup.

2. **Playing**
   - Your character will start running automatically.
   - Press **Spacebar** or **Arrow Up** to jump over land mines.
   - Survive as long as possible! The longer you last, the higher your score and the harder the game gets.

3. **Game Over**
   - If you hit a land mine, the game ends.
   - The player shows a hurt animation, and the mine explodes.
   - A stylish popup appears with your score and high score.
   - Click **Restart** to play again.

4. **Visuals & Effects**
   - Watch the background change as your score increases.
   - Enjoy the animated road, parallax stars, clouds, and cityscape.
   - Notice the game getting faster and more challenging every 500 points.

---

## Tips

- Time your jumps carefully; the mines get faster as you survive longer.
- Watch for background changes—they signal increasing difficulty.
- Try to beat your high score and enjoy the evolving visuals!

---
