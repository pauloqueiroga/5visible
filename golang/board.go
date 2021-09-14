/*
Package fivevisible implements a library for the 5visible
game engine.
*/
package fivevisible

import "errors"

// Board represents the state of a 5-visible board.
type Board struct {
	stash    map[Brick]*stack
	stacks   map[int]*stack
	winner   Brick
	nextTurn Brick
}

// NewBoard allocates a new Board struct and initializes its
// fields to the proper initial states. It returns a pointer
// to the newly allocated and initialized Board.
func NewBoard(firstTurn Brick) *Board {
	b := Board{
		stash:    make(map[Brick]*stack),
		stacks:   make(map[int]*stack),
		nextTurn: firstTurn,
	}

	b.stash[Brick0] = newStack(8)
	b.stash[Brick1] = newStack(8)

	for i := 0; i < 8; i++ {
		b.stash[Brick0].push(Brick0)
		b.stash[Brick1].push(Brick1)
	}

	b.stash[Brick0].blocked = false
	b.stash[Brick1].blocked = false

	return &b
}

// Play executes one move on the Board, from one stack or
// stach to a destination stack. It returns the Board and
// any errors encountered.
func (b *Board) Play(from int, to int) (*Board, error) {
	if b.winner != NotABrick {
		return b, errors.New("no more turns, board has a winner")
	}

	if from < 0 || from > 9 || to < 0 || to > 8 {
		return b, errors.New("to or from out of range")
	}

	fromStack, err := getFrom(b, from)

	if err != nil {
		return b, err
	}

	toStack, err := getTo(b, to)

	if err != nil {
		return b, err
	}

	brick, err := fromStack.pop()

	if err != nil {
		return b, err
	}

	_, err = toStack.push(brick)

	if err != nil {
		return b, err
	}

	b.prepNextTurn(to)
	return b, nil
}

// getFrom gets the stack from the board based on its id. It
// returns a pointer to the stack and any error encountered
// in the process of "translating" from id to stack.
func getFrom(b *Board, from int) (*stack, error) {
	var f *stack
	var err error

	if from == 9 {
		f = b.stash[b.nextTurn]
	} else {
		f = b.stacks[from]

		if len(b.stacks) < 3 {
			return f, errors.New("can't move from board now")
		}
	}

	if f == nil || !f.canPop() {
		err = errors.New("from stack is not available")
	}

	return f, err
}

// getTo gets the stack from the board based on its id. It
// returns a pointer to the stack and any error encountered
// in the process of looking for the stack with that id.
func getTo(b *Board, to int) (*stack, error) {
	var t *stack
	var ok bool

	if t, ok = b.stacks[to]; !ok {
		b.stacks[to] = newStack(3)
		t = b.stacks[to]
	}

	if !t.canPush() {
		return t, errors.New("to stack is full")
	}

	return t, nil
}

// prepNextTurn wraps up a move and sets the state of the board
// and its stacks to be ready for the next play.
func (b *Board) prepNextTurn(to int) {
	b0Count := 0
	b1Count := 0

	for key, s := range b.stacks {
		if len(s.bricks) == 0 {
			delete(b.stacks, key)
			continue
		}

		if key != to {
			s.blocked = false
		}

		top, _ := s.peek()

		switch top {
		case Brick0:
			b0Count++
		case Brick1:
			b1Count++
		}
	}

	switch {
	case b0Count >= 5:
		b.winner = Brick0
		b.nextTurn = NotABrick
	case b1Count >= 5:
		b.winner = Brick1
		b.nextTurn = NotABrick
	case b.nextTurn == Brick0:
		b.nextTurn = Brick1
		b.winner = NotABrick
	case b.nextTurn == Brick1:
		b.nextTurn = Brick0
		b.winner = NotABrick
	}
}
