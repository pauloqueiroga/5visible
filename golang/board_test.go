package fivevisible

import (
	"testing"
)

func TestNewBoardReturnsValidBoard(t *testing.T) {
	target := NewBoard(Brick0)

	if target.NextTurn != Brick0 {
		t.Errorf("Expected Brick0, found %d instead", target.NextTurn)
	}

	if target.Winner != NotABrick {
		t.Errorf("Expected no winner, found %d instead", target.Winner)
	}

	if len(target.Stash[Brick0].bricks) != 8 {
		t.Errorf("Expected 8 bricks in the stack, found %d instead", len(target.Stash[Brick0].bricks))
	}

	if len(target.Stash[Brick1].bricks) != 8 {
		t.Errorf("Expected 8 bricks in the stack, found %d instead", len(target.Stash[Brick1].bricks))
	}
}

func TestValidSequenceOfPlays001(t *testing.T) {
	target := NewBoard(Brick0)
	target.Play(9, 0) // Brick0
	target.Play(9, 1) // Brick1
	target.Play(9, 2) // Brick0
	target.Play(9, 3) // Brick1
	target.Play(9, 4) // Brick0
	target.Play(9, 5) // Brick1
	target.Play(9, 6) // Brick0
	target.Play(9, 7) // Brick1
	target.Play(9, 8) // Brick0

	if target.Winner != Brick0 {
		t.Error()
	}
}

func TestValidSequenceOfPlays002(t *testing.T) {
	target := NewBoard(Brick1)
	target.Play(9, 0) // Brick1
	target.Play(9, 1) // Brick0
	target.Play(9, 2) // Brick1
	target.Play(9, 3) // Brick0
	target.Play(9, 4) // Brick1
	target.Play(9, 5) // Brick0
	target.Play(9, 6) // Brick1
	target.Play(9, 7) // Brick0
	target.Play(9, 8) // Brick1

	if target.Winner != Brick1 {
		t.Error()
	}
}

func TestValidSequenceOfPlays003(t *testing.T) {
	target := NewBoard(Brick1)
	target.Play(9, 0) // Brick1
	target.Play(9, 1) // Brick0
	target.Play(9, 2) // Brick1
	target.Play(9, 3) // Brick0
	target.Play(9, 4) // Brick1
	target.Play(9, 5) // Brick0
	target.Play(9, 6) // Brick1
	target.Play(9, 7) // Brick0
	target.Play(9, 8) // Brick1

	if target.Winner != Brick1 {
		t.Error()
	}
}

func TestPlayDoesntAcceptOutOfRangeValues(t *testing.T) {
	target := NewBoard(Brick1)
	_, err := target.Play(10, 0) // Brick1

	if err == nil {
		t.Fatal()
	}
}

func TestPlayShouldNotAllowToMoveWithLessThanThreeStacks(t *testing.T) {
	target := NewBoard(Brick0)
	var err error
	target.Play(9, 0)
	target.Play(9, 1)
	target.Play(9, 1)
	_, err = target.Play(0, 1)

	if err == nil {
		t.Error()
	}
}

func TestPlayShouldNotAllowToMoveLastBrick(t *testing.T) {
	target := NewBoard(Brick0)
	var err error
	target.Play(9, 2)
	target.Play(9, 1)
	target.Play(9, 0)
	_, err = target.Play(0, 1)

	if err == nil {
		t.Error()
	}
}

func TestPlayShouldNotAllowStackOverflow(t *testing.T) {
	target := NewBoard(Brick1)
	target.Play(9, 0)           // Brick1
	target.Play(9, 0)           // Brick0
	target.Play(9, 0)           // Brick1
	_, err := target.Play(9, 0) // Brick0

	if err == nil {
		t.Error()
	}
}

func TestPlayShouldNotAllowToMoveWhenBoardHasWinner(t *testing.T) {
	target := NewBoard(Brick1)
	target.Play(9, 0) // Brick1
	target.Play(9, 1) // Brick0
	target.Play(9, 2) // Brick1
	target.Play(9, 3) // Brick0
	target.Play(9, 4) // Brick1
	target.Play(9, 5) // Brick0
	target.Play(9, 6) // Brick1
	target.Play(9, 7) // Brick0
	target.Play(9, 8) // Brick1

	if target.Winner != Brick1 {
		t.Error()
	}

	_, err := target.Play(9, 0)

	if err == nil {
		t.Fatal()
	}
}
