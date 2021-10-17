package main

import (
	"net/http"

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
	Hashcode         int64 `json:"hashcode" binding:"required"`
	NextPlayer       int   `json:"next-player" binding:"required"`
	Winner           int   `json:"winner"`
	Bricks0          int   `json:"bricks0"`
	Bricks1          int   `json:"bricks1"`
	LastMoveHashcode int   `json:"last-move-hashcode"`
}

var (
	errorMissingQueryParameter = errorResponse{101, "Missing required query parameter"}
	errorInvalidQueryParameter = errorResponse{102, "Invalid query parameter value"}
)

func main() {
	router := gin.Default()
	router.GET("/api/games", getGames)
	router.Run(":8080") // TODO: get rid of hardcoded port
}

func getGames(c *gin.Context) {
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

func takeSnapshot(b *game.Board) boardSnapshot {
	s := boardSnapshot{
		Hashcode:         b.Hashcode(),
		NextPlayer:       int(b.NextTurn),
		Winner:           int(b.Winner),
		Bricks0:          b.Stash[game.Brick0].Count(),
		Bricks1:          b.Stash[game.Brick1].Count(),
		LastMoveHashcode: 0,
	}

	return s
}
