package middlewares

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"

	"be/utils"
)

// RequestLogger logs incoming HTTP requests with method, path, client IP and duration.
func RequestLogger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        method := c.Request.Method
        path := c.Request.URL.Path
        clientIP := c.ClientIP()

        // Log incoming request immediately
        fmt.Printf("\n>>> INCOMING REQUEST: %s %s from %s\n", method, path, clientIP)
        utils.Logger.WithFields(map[string]interface{}{
            "method":   method,
            "path":     path,
            "client_ip": clientIP,
        }).Info("http_request_incoming")

        c.Next()

        status := c.Writer.Status()
        duration := time.Since(start)
        fmt.Printf("<<< RESPONSE: %s %s - Status: %d - Duration: %s\n", method, path, status, duration)
        
        entry := utils.Logger.WithFields(map[string]interface{}{
            "method":   method,
            "path":     path,
            "status":   status,
            "client_ip": clientIP,
            "duration": duration.String(),
        })

        if wallet := c.GetHeader("X-Wallet-Address"); wallet != "" {
            entry = entry.WithField("wallet", wallet)
        }
        if msg := c.GetHeader("X-Message"); msg != "" {
            entry = entry.WithField("x_message", msg)
        }
        if sig := c.GetHeader("X-Signature"); sig != "" {
            entry = entry.WithField("x_signature", sig)
        }

        entry.Info("http_request")
    }
}
