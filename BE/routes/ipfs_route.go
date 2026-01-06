package routes

import (
	"be/controllers"
	"be/middlewares"
	"github.com/gin-gonic/gin"
)

func RegisterIPFSRoutes(r *gin.Engine) {
	ipfs := r.Group("/api/ipfs")
	ipfs.Use(middlewares.AuthSignatureMiddleware())
	{
		ipfs.POST("/upload", controllers.UploadToIPFS)
		ipfs.GET("/:hash", controllers.GetFromIPFS)
	}
}
