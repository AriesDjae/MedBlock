package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"be/config"
	"be/routes"
)

func main() {
	_ = godotenv.Load()

	config.InitBlockchain()

	r := gin.Default()
	routes.RegisterRoutes(r)

	log.Println("🚀 Backend running at :8080")
	r.Run(":8080")
}
