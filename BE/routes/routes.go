package routes

import (
	"github.com/gin-gonic/gin"

	"be/controllers"
	"be/middlewares"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")
	api.Use(middlewares.AuthMiddleware())
	{
		api.POST("/medical-record", controllers.CreateMedicalRecord)
	}
}
