# Gun Challenge

<img width="1376" height="768" alt="Gun Challenge game" src="https://github.com/user-attachments/assets/7c87ac0c-9e3f-41d7-bd07-da17fc960051" />

## About the Game

**Gun Challenge** is a browser-based target shooting game. Targets move across the arena, and the player aims a gun at the bottom of the screen and shoots them down before running out of chances.

The game has **5 stages**, each with its own environment, target shape, and difficulty. Every stage has more targets that move faster and get smaller, and each hit is worth more points.

| Stage | Name | Difficulty | Targets | Points per Hit |
|---|---|---|---|---|
| 1 | Desert Outpost | Easy | 4 | 10 |
| 2 | Midnight Alley | Easy | 6 | 20 |
| 3 | Neon Cyber | Medium | 9 | 35 |
| 4 | Arctic Base | Hard | 10 | 40 |
| 5 | Final Fortress | Master | 14 | 100 |

### Background

I chose a shooting game because it is simple to understand but fun to master. Building it was a good way to practice DOM manipulation, moving elements with `requestAnimationFrame`, hit detection, and managing game state across multiple stages.

## Getting Started

**Play the game here:** [Gun Challenge](https://hussaindx3.github.io/Gun-Game/)

**Planning materials:** [Project board](https://github.com/users/Hussaindx3/projects/2)

### How to Play

1. Choose a stage from the **Select Stage** menu and click **Play Now**.
2. Move your mouse left and right to aim.
3. Click inside the arena to shoot. Your shot hits the closest target above the gun.
4. Clear all targets to move to the next stage.
5. If you miss **more than 3 shots**, you lose.
6. Clear all 5 stages to win the game.

Use **How to Play** to see the rules again, **Restart** to start over from Stage 1, and **Music** to turn the background music on or off.

## Attributions

This project does not use any external libraries or assets. All sounds are generated with the Web Audio API, and all graphics (the gun, the targets, and the backgrounds) are drawn with CSS.

## Technologies Used

- HTML5
- CSS3 (Flexbox, Grid, animations)
- JavaScript (ES6)
- Web Audio API
- Git & GitHub
- GitHub Pages (deployment)
- GitHub Projects (planning)

## Project Structure

```
Gun-Game/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── Data.js
    └── app.js
```

## Next Steps

- Save the high score in the browser with `localStorage`.
- Add touch controls and a responsive layout so the game can be played on phones.
- Add keyboard controls to make the game more accessible.
- Add new target types, like targets that take two hits or move in patterns.
- Add a volume slider for the music and sound effects.
