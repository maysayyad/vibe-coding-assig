# Vibe Coding Experience Documentation

## Tool Selection Justification
I chose Replit Agent as my vibe coding tool because it provides a conversational, agent-based development experience directly inside the development environment. This made it well suited for building a logic-heavy project like a Tetris game, where the AI could reason about game loops, collision detection, and state management rather than simply completing lines of code.

## Development Process
I began development by describing the full Tetris game requirements in natural language to Replit Agent. The agent generated the initial project structure and core game logic, including the grid, tetromino behavior, keyboard controls, and scoring system. I tested the game and used follow-up prompts to iteratively refine the implementation, which felt similar to pair programming rather than traditional code completion.

## Challenges and Solutions
One challenge I encountered was ensuring that the score increased correctly when lines were cleared. The initial implementation did not update the score as expected. Through iterative prompts and manual review, I refined the scoring logic until it worked correctly. Another challenge was handling block rotation near the edges of the grid, which required improving collision detection logic.

## Reflection
This project changed how I think about software development. Instead of focusing on writing every line of code manually, I focused on describing desired behavior and validating results. I was surprised by how effectively the AI handled complex logic. I would use vibe coding tools again for prototyping and educational projects, as they significantly reduce development time while still requiring human oversight.
