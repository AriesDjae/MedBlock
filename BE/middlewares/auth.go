package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		wallet := c.GetHeader("X-Wallet-Address")
		if wallet == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Wallet address required",
			})
			return
		}
		c.Next()
	}
}
