package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	game "pauloq.com/fivevisible"
)

// errorResponse provides a standard error message body for all
// REST responses.
type errorResponse struct {
	Code    int    `json:"error-code"`
	Message string `json:"message"`
}

// boardSnapshot provides the "visible" state of the board.
type boardSnapshot struct {
	Hashcode         int64           `json:"hashcode" binding:"required"`
	NextPlayer       int             `json:"next-player" binding:"required"`
	Winner           int             `json:"winner"`
	Bricks0          int             `json:"bricks0"`
	Bricks1          int             `json:"bricks1"`
	LastMoveHashcode int             `json:"last-move-hashcode"`
	Stacks           []stackSnapshot `json:"stacks"`
}

// stackSnapshot provides the "visible" properties of a stack.
type stackSnapshot struct {
	Id         int  `json:"Id"`
	Hashcode   int8 `json:"hashcode" binding:"required"`
	Count      int  `json:"count"`
	Top        int  `json:"top"`
	CanProvide bool `json:"can-provide"`
}

var (
	errorMissingQueryParameter = errorResponse{101, "Missing required query parameter"}
	errorInvalidQueryParameter = errorResponse{102, "Invalid query parameter value"}
	errorInvalidBodyFormat     = errorResponse{103, "Invalid format in the body of the request"}
)

func main() {
	router := gin.Default()
	router.GET("/api/games", newGame)
	router.PATCH("/api/games", applyMove)
	router.Run(":8080") // TODO: get rid of hardcoded port
}

func newGame(c *gin.Context) {
	firstTurnParam := c.DefaultQuery("first-turn", "unknown")
	firstPlayer := game.NotABrick

	switch firstTurnParam {
	case "unknown":
		c.IndentedJSON(http.StatusBadRequest, errorMissingQueryParameter)
		return
	case "0":
		firstPlayer = game.Brick0
	case "1":
		firstPlayer = game.Brick1
	}

	if firstPlayer == game.NotABrick {
		c.IndentedJSON(http.StatusBadRequest, errorInvalidQueryParameter)
		return
	}

	board := game.NewBoard(firstPlayer)
	c.IndentedJSON(http.StatusOK, takeSnapshot(board))
}

func applyMove(c *gin.Context) {
	fromStackParam := c.Query("from-stack")
	toStackParam := c.Query("to-stack")

	if fromStackParam == "" || toStackParam == "" {
		c.IndentedJSON(http.StatusBadRequest, errorMissingQueryParameter)
	}

	from, err := strconv.Atoi(fromStackParam)

	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, errorInvalidQueryParameter)
	}

	to, err := strconv.Atoi(toStackParam)

	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, errorInvalidQueryParameter)
	}

	var boardView boardSnapshot

	if err := c.BindJSON(&boardView); err != nil {
		c.IndentedJSON(http.StatusBadRequest, errorInvalidBodyFormat)
	}

	board := game.BoardFromHashcode(boardView.Hashcode)
	board.NextTurn = game.Brick(boardView.NextPlayer)
	moveHash, err := board.Play(from, to)

	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, errorInvalidBodyFormat)
	}

	result := takeSnapshot(board)
	result.LastMoveHashcode = int(moveHash)
	result.Stacks = boardView.Stacks
	c.IndentedJSON(http.StatusOK, result)
}

func takeSnapshot(b *game.Board) boardSnapshot {
	snap := boardSnapshot{
		Hashcode:         b.Hashcode(),
		NextPlayer:       int(b.NextTurn),
		Winner:           int(b.Winner),
		Bricks0:          b.Stash[game.Brick0].Count(),
		Bricks1:          b.Stash[game.Brick1].Count(),
		LastMoveHashcode: 0,
	}

	return snap
}

func takeStackSnapshot(id int, stack *game.Stack) stackSnapshot {
	snap := stackSnapshot{
		Id:       id,
		Hashcode: stack.Hashcode(),
		Count:    stack.Count(),
	}

	snap.Top = int(stack.Peek())
	return snap
}
