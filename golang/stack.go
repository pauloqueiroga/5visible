package fivevisible

import (
	"errors"
)

type Brick int

const (
	NotABrick Brick = iota
	Brick0
	Brick1
)

type stack struct {
	bricks  []Brick
	cap     int
	blocked bool
}

func newStack(cap int) *stack {
	s := stack{bricks: make([]Brick, 0), cap: cap}
	return &s
}

func (s *stack) canPop() bool {
	return !s.blocked && len(s.bricks) > 0
}

func (s *stack) canPush() bool {
	return s.cap > len(s.bricks)
}

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

func (s *stack) peek() (Brick, error) {
	if len(s.bricks) == 0 {
		return NotABrick, errors.New("stack is empty")
	}

	return s.bricks[len(s.bricks)-1], nil
}

func (s *stack) pop() (Brick, error) {
	if !s.canPop() {
		return NotABrick, errors.New("stack is blocked or empty")
	}

	n := len(s.bricks) - 1
	popped := s.bricks[n]
	s.bricks = s.bricks[:n]
	return popped, nil
}

func (s *stack) hashcode() int64 {
	return 0
}
