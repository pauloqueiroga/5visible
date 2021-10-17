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

func TestCountOnEmptyStackReturnsZero(t *testing.T) {
	target := newStack(3)
	count := target.Count()

	if count != 0 {
		t.Errorf("Expected to find 0 bricks, instead found %d", count)
	}
}

func TestCountOnPopulatedStacksReturnsCorrectAmounts(t *testing.T) {
	target := newStack(3)
	target.push(Brick0)
	count := target.Count()

	if count != 1 {
		t.Errorf("Expected to find 1 brick, instead found %d", count)
	}

	target.push(Brick0)
	count = target.Count()

	if count != 2 {
		t.Errorf("Expected to find 2 bricks, instead found %d", count)
	}

	target.push(Brick0)
	count = target.Count()

	if count != 3 {
		t.Errorf("Expected to find 3 bricks, instead found %d", count)
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

	if top := target.Peek(); top != Brick0 {
		t.Error("First peek failed")
	}

	target, err = target.push(Brick1)

	if err != nil {
		t.Error("Failed to push second brick")
	}

	if top := target.Peek(); top != Brick1 {
		t.Error("Second peek failed")
	}

	if top := target.Peek(); top != Brick1 {
		t.Error("Third peek failed")
	}
}

func TestPeekReturnsErrorOnEmptyStack(t *testing.T) {
	target := newStack(3)
	top := target.Peek()

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

	if top := target.Peek(); top != Brick0 {
		t.Error("First peek failed")
	}

	target, err = target.push(Brick1)

	if err != nil {
		t.Error("Failed to push second brick")
	}

	if top := target.Peek(); top != Brick1 {
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

func TestStackXRayForEmptyStack(t *testing.T) {
	target := newStack(3)
	xRay := target.xRay()

	if xRay != 0b000 {
		t.Errorf("Expected to find 0, found %b instead", xRay)
	}
}

func TestStackXRayForMultipleStacks(t *testing.T) {
	target := newStack(3)
	target.push(Brick1)
	xRay := target.xRay()

	if xRay != 0b001 {
		t.Errorf("Expected to find 1, found %b instead", xRay)
	}

	target.push(Brick1)
	xRay = target.xRay()

	if xRay != 0b011 {
		t.Errorf("Expected to find 11, found %b instead", xRay)
	}

	target.push(Brick0)
	xRay = target.xRay()

	if xRay != 0b110 {
		t.Errorf("Expected to find 110, found %b instead", xRay)
	}
}

func TestStachHashcodesFromSpecExamples(t *testing.T) {
	// (00000000) - Stack cannot be drawn from Top-to-bottom: [_, _, _]	0b00 = 0 bricks in this stack
	target := newStack(3)
	hash := target.Hashcode()

	if hash != 0 {
		t.Errorf("Expected to find hashcode 0, found %b instead", hash)
	}

	// (00000001)	-	Stack cannot be drawn from	Top-to-bottom: [0, _, _]	0b01 = 1 brick in this stack
	target.push(Brick0)
	hash = target.Hashcode()

	if hash != 1 {
		t.Errorf("Expected to find hashcode 1, found %b instead", hash)
	}

	// (00011011)	-	Stack cannot be drawn from	Top-to-bottom: [0, 1, 1]	0b11 = 3 bricks in this stack
	target = newStack(3)
	target.push(Brick1)
	target.push(Brick1)
	target.push(Brick0)
	hash = target.Hashcode()

	if hash != 0b11011 {
		t.Errorf("Expected to find hashcode 11011, found %b instead", hash)
	}

	// (00101010)	-	Stack can be drawn from	Top-to-bottom: [0, 1, _]	0b10 = 2 bricks in this stack
	target = newStack(3)
	target.push(Brick1)
	target.push(Brick0)
	target.blocked = false
	hash = target.Hashcode()

	if hash != 0b101010 {
		t.Errorf("Expected to find hashcode 101010, found %b instead", hash)
	}

	// (00111111)	-	Stack can be drawn from	Top-to-bottom: [1, 1, 1]	0b11 = 3 bricks in this stack
	target = newStack(3)
	target.push(Brick1)
	target.push(Brick1)
	target.push(Brick1)
	target.blocked = false
	hash = target.Hashcode()

	if hash != 0b111111 {
		t.Errorf("Expected to find hashcode 111111, found %b instead", hash)
	}
}
