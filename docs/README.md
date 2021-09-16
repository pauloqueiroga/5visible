# 5-Visible
![build-test](https://github.com/pauloqueiroga/5visible/actions/workflows/build-test.yml/badge.svg)

## Rules of the game
* 2 players (`0` and `1`)
* 8 bricks per player
* Board has 9 positions for stacks of bricks to be formed
* Each stack can have up to 3 bricks
* Players cannot peek/see under the topmost brick on each stack
* On each round, a player has to make one and only one move:
    * Add one of their own bricks to the board, on any stack
    * Move one brick (their own or opoonent's) from one stack to another, except:
        * Players cannot move the brick most recently moved by their opponent
        * If there are less than 3 stacks on the board, the player has to add a brick to the board, on any stack
* Wins the player with 5 of their bricks showing on the board
