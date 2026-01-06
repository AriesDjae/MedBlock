package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"be/utils"
)

const defaultMessage = "Medblock Authentication"

func AuthSignatureMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path
		method := c.Request.Method
		
		utils.Logger.WithFields(map[string]interface{}{
			"path":   path,
			"method": method,
		}).Info("auth: middleware called")

		message := c.GetHeader("X-Message")
		signature := c.GetHeader("X-Signature")

		utils.Logger.WithFields(map[string]interface{}{
			"path":      path,
			"has_message": message != "",
			"has_signature": signature != "",
		}).Info("auth: checking headers")

		if message == "" || signature == "" {
			utils.Logger.WithFields(map[string]interface{}{
				"path": path,
				"error": "missing message or signature",
			}).Warn("auth: missing credentials")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Message and signature are required",
			})
			return
		}

		address, err := utils.VerifySignature(message, signature)
		if err != nil {
			utils.Logger.WithFields(map[string]interface{}{
				"path":  path,
				"error": err.Error(),
			}).Warn("auth: invalid signature")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid signature: " + err.Error(),
			})
			return
		}
		
		utils.Logger.WithFields(map[string]interface{}{
			"path":    path,
			"wallet":  address,
		}).Info("auth: signature verified, allowing request")
		
		c.Set("wallet_address", address)
		c.Next()
	}
}
