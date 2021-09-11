# Representing States With Hashcodes
If each stack fits in 1 byte or less, and the entire board state can be represented by 1 8-byte integer, which can provide for some really compact and fast storage of board states. The two players can be represented by one bit, `0` or `1`.

Although it would be possible to decode a hashcode to a state, this operation might not be necessary to implement, since using a more verbose serialization allows for easier maintenance and debugging, at a satisfactory serialized size. The use of hashcode is recommended for storing, indexing and searching states.

## Stack Hashcode
| Bits | Contents       | 
|:-:|----------------|
| `0..1` | Number of bricks in the stack (0-3). | 
| `2`    | Brick at the top of the stack (`0` or `1`) if the stack is not empty. `0` otherwise. | 
| `3`    | Second brick from the top of the stack (`0` or `1`) if the stack has 2 or more bricks. `0` otherwise. |
| `4`    | Third brick from the top of the stack (`0` or `1`) if the stack has 3 bricks. `0` otherwise. |
| `5` | Stack available for drawing (`1`) or blocked for drawing (`0`). The stack shall be marked blocked (`0`) for drawing when: (a) it's empty; (b) a brick was added to it in the previous play; and (c) there are less than 3 non-empty stacks on the board. | 
| `6..7` | Unused

### Examples:
| Hashcode | 7&nbsp;6 | 5 | 4&nbsp;3&nbsp;2 | 1&nbsp;0 |
|-:|:--:|:-:|:---:|:--:|
| 0 0x00 |`00`|`0`|`000`|`00`|
| (`00000000`)| - | Stack cannot be drawn from | Top-to-bottom: [`_`, `_`, `_`] | `0b00` = 0 bricks in this stack |
| 1 0x01 |`00`|`0`|`000`|`01`|
| (`00000001`)| - | Stack cannot be drawn from | Top-to-bottom: [`0`, `_`, `_`] | `0b01` = 1 brick in this stack |
| 27 0x1B)|`00`|`0`|`110`|`11`|
|  (`00011011`| - | Stack cannot be drawn from | Top-to-bottom: [`0`, `1`, `1`] | `0b11` = 3 bricks in this stack |
| 42 0x2A |`00`|`1`|`010`|`10`|
| (`00101010`)| - | Stack can be drawn from | Top-to-bottom: [`0`, `1`, `_`] | `0b10` = 2 bricks in this stack |
| 63 0x3F |`00`|`1`|`111`|`11`|
| (`00111111`)| - | Stack can be drawn from | Top-to-bottom: [`1`, `1`, `1`] | `0b11` = 3 bricks in this stack |

## Board Hashcode
It only makes sense to calculate the hashcode of the state of the board when it doesn't have a winner. We can combine 8 stack hashcodes in one 8-byte integer, since any time the 9th stack is utilized, the board is guaranteed to have a winner and is not playable anymore. We can also ignore the bricks that are not in the board yet when calculating the board hashcode.

In order to make easier to identify equivalent states of the board, the hashcode should represent stack hashcodes from lowest to highest (numerically).

### Examples:
| Hashcode | Stack 1| Stack 2 | Stack 3 | Stack 4 | Stack 5| Stack 6|Stack 7 |Stack 8 |
|--:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
|63 0x000000000000003F|0x3F | - | - | - | - | - | - | - |
|319 0x000000000000013F|0x3F | 0x01 | - | - | - | - | - | - |
|4531 0x0000000000011B3F|0x3F | 0x1B | 0x01 | - | - | - | - | - |
|3038287259131848223 0x2A2A2A2A2626261F|0x1F|0x26|0x26|0x26|0x2A|0x2A|0x2A|0x2A|

## Move Hashcode
One straight-forward way to represent a move from one stack to another based only on the initial state of each stack is to simply combine the 2 stack hashcodes in one 2-byte integer.

Special cases can be coded as 0xFF (255) to represent the bricks that are added to the board, and not drawn from another stack.

### Examples:
|Hashcode| From | To |
|--:|--:|--:|
|10794 0x2A2A| 42 0x2A | 42 0x2A |
|16170 0x3F2A| 63 0x3F | 63 0x2A |
|65281 0xFF01| 255 0xFF | 1 0x01|

## Bringing It All Together
|Board Hashcode|Move Hashcode|TotalCount|0Wins|1Wins|
|--:|--:|--:|--:|--:|
|63 0x000000000000003F|65280 0xFF00|16,544|534|16,010|
|76351 0x0000000000012A3F|16170 0x3F2A|15,230|10,011|5,219|
|76351 0x0000000000012A3F|65322 0xFF2A|1,230|1,003|227|
