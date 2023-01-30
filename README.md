# Board Game API
Small simple action based game-agnostic API for use making board game apps

## Goals

This API is meant to be completely game agnostic allowing people to program
games in whatever format they want (I plan to program a few using React web
apps) and use this as a backend. The backend needs no knowledge of the game at
all but enforces rules based on consensus from the players. If all players agree
that an action is legal, than it is and we move forward. This is made as a pet
project and not meant for commercial/production use.

This API doesn't take care of hidden information. Players can inspect the data
traveling to see hidden information in the game. This API is not concerned with
stopping players from cheating by looking at this information.

This API also doens't care about speed, it's not meant for real time games, only
games where we're ok taking full roundtrips for each client to validate each
move.

We are going to start out with a simple data implementation that isn't thread
safe or process safe. If I stay interested in the project other data
implementations may get implemented.

## Simple Sequence Diagram

![Sequence Diagram](/seq.png)

Generated from [seq.plantuml](./seq.plantuml)
