package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"be/config"
	"be/middlewares"
	"be/routes"
	"be/utils"
)

func main() {
	_ = godotenv.Load()

	// init structured logger
	utils.InitLogger()

	config.InitBlockchain()

	// init firebase/firestore when available
	firebaseApp := config.InitFirebase()
	if firebaseApp != nil {
		config.InitFirestore(firebaseApp)
	}

	r := gin.Default()

	// Allow CORS for local frontend during development
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "X-Wallet-Address", "X-Message", "X-Signature"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowAllOrigins:   false,
	}))

	// Request logging
	r.Use(middlewares.RequestLogger())

	routes.RegisterRoutes(r)

	// IPFS routes (upload / fetch)
	routes.RegisterIPFSRoutes(r)

	port := utils.GetEnv("PORT", "8080")
	utils.Logger.Infof("🚀 Backend running at :%s", port)
	r.Run(":" + port)
}
