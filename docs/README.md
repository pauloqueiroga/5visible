# 5-Visible
![build-test](https://github.com/pauloqueiroga/5visible/actions/workflows/build-test.yml/badge.svg)  
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=pauloqueiroga_5visible&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=pauloqueiroga_5visible)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=pauloqueiroga_5visible&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=pauloqueiroga_5visible)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=pauloqueiroga_5visible&metric=security_rating)](https://sonarcloud.io/dashboard?id=pauloqueiroga_5visible)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=pauloqueiroga_5visible&metric=alert_status)](https://sonarcloud.io/dashboard?id=pauloqueiroga_5visible)  
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=pauloqueiroga_5visible&metric=bugs)](https://sonarcloud.io/dashboard?id=pauloqueiroga_5visible)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=pauloqueiroga_5visible&metric=code_smells)](https://sonarcloud.io/dashboard?id=pauloqueiroga_5visible)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=pauloqueiroga_5visible&metric=coverage)](https://sonarcloud.io/dashboard?id=pauloqueiroga_5visible)

## Links
- [API Doc](https://www.tikitala.com/api-doc/)  
- [www.tikitala.com](https://www.tikitala.com)

# 5-Visible
![build-test](https://github.com/pauloqueiroga/5visible/actions/workflows/build-test.yml/badge.svg)  
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=pauloqueiroga_5visible&metric=alert_status)](https://sonarcloud.io/dashboard?id=pauloqueiroga_5visible)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=pauloqueiroga_5visible&metric=alert_status)](https://sonarcloud.io/dashboard?id=pauloqueiroga_5visible)  
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=pauloqueiroga_5visible&metric=bugs)](https://sonarcloud.io/dashboard?id=pauloqueiroga_5visible)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=pauloqueiroga_5visible&metric=code_smells)](https://sonarcloud.io/dashboard?id=pauloqueiroga_5visible)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=pauloqueiroga_5visible&metric=coverage)](https://sonarcloud.io/dashboard?id=pauloqueiroga_5visible)

## Links
- [API Doc](https://www.tikitala.com/api-doc/)  
- [www.tikitala.com](https://www.tikitala.com)

## Rules of the game
* 2 players (`0` and `1`)
* 8 bricks per player
* Board has 9 positions for stacks of bricks to be formed
* Each stack can have up to 3 bricks
* Players cannot peek/see under the topmost brick on each stack
* Initial board setup contains 4 stacks of 1 brick, 2 for each player
* On each round, a player has to make one and only one move:
    * Add one of their own bricks to the board, on any stack
    * Move one brick (their own or opponent's) from one stack to another, except:
        * Players cannot move the brick most recently moved by their opponent
* Wins the player with 5 of their bricks showing on the board
