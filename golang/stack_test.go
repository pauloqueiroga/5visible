package fivevisible

import (
	"testing"
)

func TestNewStackCreatesStackFor3(t *testing.T) {
	target := newStack(3)

	if target.cap != 3 {
		t.Errorf("Expected capacity 3, created with %d", target.cap)
	}
}

func TestNewStackCreatesStackFor9(t *testing.T) {
	target := newStack(9)

	if target.cap != 9 {
		t.Errorf("Expected capacity 9, created with %d", target.cap)
	}
}

func TestPushCantGoOverCapacity(t *testing.T) {
	target := newStack(3)

	for i := 0; i < 3; i++ {
		var err error
		target, err = target.push(Brick0)

		if err != nil {
			t.Errorf("Failed to push item %d", i)
		}
	}

	var err error
	_, err = target.push(Brick0)

	if err == nil {
		t.Error("Accepted push beyond capacity")
	}
}

func TestPushWontTakeNotABrick(t *testing.T) {
	target := newStack(1)
	var err error
	_, err = target.push(NotABrick)

	if err == nil {
		t.Error("Stack should not accept anything other than Brick0 or Brick1")
	}
}

func TestPeekReturnsCorrectBrickAfterPushing(t *testing.T) {
	target := newStack(3)
	var err error
	target, err = target.push(Brick0)

	if err != nil {
		t.Error("Failed to push first brick")
	}

	if top, e := target.peek(); e != nil || top != Brick0 {
		t.Error("First peek failed")
	}

	target, err = target.push(Brick1)

	if err != nil {
		t.Error("Failed to push second brick")
	}

	if top, e := target.peek(); e != nil || top != Brick1 {
		t.Error("Second peek failed")
	}

	if top, e := target.peek(); e != nil || top != Brick1 {
		t.Error("Third peek failed")
	}
}

func TestPeekReturnsErrorOnEmptyStack(t *testing.T) {
	target := newStack(3)
	top, err := target.peek()

	if err == nil {
		t.Error("Should have returned an error")
	}

	if top != NotABrick {
		t.Error("Should have returned NotABrick")
	}
}

func TestPopReturnsErrorOnEmptyStack(t *testing.T) {
	target := newStack(3)
	top, err := target.pop()

	if err == nil {
		t.Error("Should have returned an error")
	}

	if top != NotABrick {
		t.Error("Should have returned NotABrick")
	}
}

func TestCanPopReturnsFalseIfBlockedOrEmpty(t *testing.T) {
	target := newStack(3)

	if target.canPop() {
		t.Fatal("Empty stack should have returned false on canPop")
	}

	target.push(Brick1)

	if target.canPop() {
		t.Fatal("Recently pushed stack should have returned false on canPop")
	}
}

func TestCanPushReturnsFalseOnFullStack(t *testing.T) {
	target := newStack(1)
	target.push(Brick0)

	if target.canPush() {
		t.Error("Full stack should have returned false on canPush")
	}
}

func TestPushPeekPopSequence(t *testing.T) {
	target := newStack(3)
	var err error
	target, err = target.push(Brick0)

	if err != nil {
		t.Error("Failed to push first brick")
	}

	if top, e := target.peek(); e != nil || top != Brick0 {
		t.Error("First peek failed")
	}

	target, err = target.push(Brick1)

	if err != nil {
		t.Error("Failed to push second brick")
	}

	if top, e := target.peek(); e != nil || top != Brick1 {
		t.Error("Second peek failed")
	}

	if top, e := target.pop(); e == nil || top != NotABrick {
		t.Error("First pop should have been blocked")
	}

	target.blocked = false

	if top, e := target.pop(); e != nil || top != Brick1 {
		t.Error("Second pop failed")
	}

	if top, e := target.pop(); e != nil || top != Brick0 {
		t.Error("Second pop failed")
	}
}
