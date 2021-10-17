package fivevisible

import (
	"errors"
)

// Brick identifies each of the players in the game.
type Brick int

const (
	NotABrick Brick = iota
	Brick0
	Brick1
)

// Stack represents the state of each Stack on the board of 5-visible.
type Stack struct {
	bricks  []Brick
	cap     int
	blocked bool
}

// Count returns the number of bricks currently in the stack.
func (s *Stack) Count() int {
	return len(s.bricks)
}

// newStack allocates a new stack and initializes it with the correct
// capacity.
func newStack(cap int) *Stack {
	s := Stack{bricks: make([]Brick, 0), cap: cap}
	return &s
}

// canPop returns if the stack can be used as a "source" of bricks.
func (s *Stack) canPop() bool {
	return !s.blocked && len(s.bricks) > 0
}

// canPush returns if the stack still has capacity available for one more brick.
func (s *Stack) canPush() bool {
	return s.cap > len(s.bricks)
}

// push places a Brick at the top of the stack, and marks the stack as blocked.
func (s *Stack) push(b Brick) (*Stack, error) {
	if len(s.bricks) == s.cap {
		return s, errors.New("can't push, stack is full")
	}

	if b == NotABrick {
		return s, errors.New("not a brick")
	}

	s.bricks = append(s.bricks, b)
	s.blocked = true
	return s, nil
}

// Peek returns the Brick at the top of the stack, without removing it.
func (s *Stack) Peek() Brick {
	if len(s.bricks) == 0 {
		return NotABrick
	}

	return s.bricks[len(s.bricks)-1]
}

// pop removes tha Brick at the top of the stack and returns it.
func (s *Stack) pop() (Brick, error) {
	if !s.canPop() {
		return NotABrick, errors.New("stack is blocked or empty")
	}

	n := len(s.bricks) - 1
	popped := s.bricks[n]
	s.bricks = s.bricks[:n]
	return popped, nil
}

// xRay creates an binary-encoded integer that represents all the bricks
// in a stack with the top of the stack being the least significant bit.
func (s *Stack) xRay() int8 {
	var encoded int8 = 0

	for _, b := range s.bricks {
		encoded <<= 1

		if b == Brick1 {
			encoded += 0b1
		}
	}

	return encoded
}

// Hashcode calculates and returns the Hashcode for a given stack.
func (s *Stack) Hashcode() int8 {
	const drawableBit int8 = 0b100000
	const xRayBits int8 = 0b11100
	const countBits int8 = 0b11
	var hash int8 = 0

	if s.canPop() {
		hash += drawableBit
	}

	hash += (s.xRay() << 2) & xRayBits
	hash += int8(s.Count()) & countBits
	return hash
}
