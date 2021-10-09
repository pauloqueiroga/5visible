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

// stack represents the state of each stack on the board of 5-visible.
type stack struct {
	bricks  []Brick
	cap     int
	blocked bool
}

func (s *stack) Count() int {
	return len(s.bricks)
}

// newStack allocates a new stack and initializes it with the correct
// capacity
func newStack(cap int) *stack {
	s := stack{bricks: make([]Brick, 0), cap: cap}
	return &s
}

// canPop returns if the stack can be used as a "source" of bricks.
func (s *stack) canPop() bool {
	return !s.blocked && len(s.bricks) > 0
}

// canPush returns if the stack stil has capacity available for one more brick.
func (s *stack) canPush() bool {
	return s.cap > len(s.bricks)
}

// push places a Brick at the top of the stack, and marks the stack as blocked.
func (s *stack) push(b Brick) (*stack, error) {
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

// peek returns the Brick at the top of the stack, without removing it.
func (s *stack) peek() (Brick, error) {
	if len(s.bricks) == 0 {
		return NotABrick, errors.New("stack is empty")
	}

	return s.bricks[len(s.bricks)-1], nil
}

// pop removes tha Brick at the top of the stack and returns it.
func (s *stack) pop() (Brick, error) {
	if !s.canPop() {
		return NotABrick, errors.New("stack is blocked or empty")
	}

	n := len(s.bricks) - 1
	popped := s.bricks[n]
	s.bricks = s.bricks[:n]
	return popped, nil
}

// hashcode calculates and returns the hashcode for a given stack.
func (s *stack) hashcode() int {
	// TODO: Not implemented!!!
	return 0
}
