package routes

import (
	"github.com/gin-gonic/gin"

	"be/controllers"
	"be/middlewares"
)

func RegisterRoutes(r *gin.Engine) {
	// Public routes
	r.GET("/api/services", controllers.GetServices)
	r.POST("/api/register", controllers.Register)
	r.POST("/api/nonce", controllers.RequestNonce)
	r.POST("/api/login", controllers.Login)

	api := r.Group("/api")
	api.Use(middlewares.AuthSignatureMiddleware())
	{
		api.POST("/medical-record", controllers.CreateMedicalRecord)
		api.GET("/medical-record", controllers.GetMedicalRecords)
	}
}
