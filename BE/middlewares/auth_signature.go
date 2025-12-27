package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"be/utils"
)

const defaultMessage = "Medblock Authentication"

func AuthSignatureMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		message := c.GetHeader("X-Message")
		signature := c.GetHeader("X-Signature")

		if message == "" || signature == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Message and signature are required",
			})
			return
		}

		address, err := utils.VerifySignature(message, signature)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid signature",
			})
			return
		}
		
		c.Set("wallet_address", address)
		c.Next()
	}
}
