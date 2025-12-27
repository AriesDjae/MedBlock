package controllers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	"be/config"
	"be/services"
	"be/utils"
)

// GetServices returns status information about running backend services.
func GetServices(c *gin.Context) {
    // check for firebase json presence
    _, err := os.Stat("config/firebase.json")
    firebasePresent := err == nil

    ethConnected := config.EthClient != nil
    records := services.GetAllMedicalRecords()

    utils.Logger.WithFields(map[string]interface{}{
        "eth_connected":     ethConnected,
        "firebase_present":  firebasePresent,
        "in_memory_records": len(records),
    }).Info("services_status")

    c.JSON(http.StatusOK, gin.H{
        "eth_connected":     ethConnected,
        "firebase_present":  firebasePresent,
        "in_memory_records": len(records),
    })
}
