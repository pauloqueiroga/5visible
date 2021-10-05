/*
Package fivevisible implements a library for the 5visible
game engine.
*/
package fivevisible

import "errors"

// Board represents the state of a 5-visible board.
type Board struct {
	Stash    map[Brick]*stack
	Stacks   map[int]*stack
	Winner   Brick
	NextTurn Brick
}

// NewBoard allocates a new Board struct and initializes its
// fields to the proper initial states. It returns a pointer
// to the newly allocated and initialized Board.
func NewBoard(firstTurn Brick) *Board {
	b := Board{
		Stash:    make(map[Brick]*stack),
		Stacks:   make(map[int]*stack),
		NextTurn: firstTurn,
	}

	b.Stash[Brick0] = newStack(8)
	b.Stash[Brick1] = newStack(8)

	for i := 0; i < 8; i++ {
		b.Stash[Brick0].push(Brick0)
		b.Stash[Brick1].push(Brick1)
	}

	b.Stash[Brick0].blocked = false
	b.Stash[Brick1].blocked = false

	return &b
}

// Play executes one move on the Board, from one stack or
// stash to a destination stack. It returns the Board and
// any errors encountered.
func (b *Board) Play(from int, to int) (*Board, error) {
	if b.Winner != NotABrick {
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

func (b *Board) Hashcode() int64 {
	// TODO: Missing implementation!!!
	return 0
}

// getFrom gets the stack from the board based on its id. It
// returns a pointer to the stack and any error encountered
// in the process of "translating" from id to stack.
func getFrom(b *Board, from int) (*stack, error) {
	var f *stack
	var err error

	if from == 9 {
		f = b.Stash[b.NextTurn]
	} else {
		f = b.Stacks[from]

		if len(b.Stacks) < 3 {
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

	if t, ok = b.Stacks[to]; !ok {
		b.Stacks[to] = newStack(3)
		t = b.Stacks[to]
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

	for key, s := range b.Stacks {
		if len(s.bricks) == 0 {
			delete(b.Stacks, key)
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
		b.Winner = Brick0
		b.NextTurn = NotABrick
	case b1Count >= 5:
		b.Winner = Brick1
		b.NextTurn = NotABrick
	case b.NextTurn == Brick0:
		b.NextTurn = Brick1
		b.Winner = NotABrick
	case b.NextTurn == Brick1:
		b.NextTurn = Brick0
		b.Winner = NotABrick
	}
}
