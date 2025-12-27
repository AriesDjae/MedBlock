package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"be/models"
	"be/services"
	"be/utils"
)

func CreateMedicalRecord(c *gin.Context) {
	wallet := c.GetHeader("X-Wallet-Address")
	utils.Logger.WithField("wallet", wallet).Info("CreateMedicalRecord called")
	var record models.MedicalRecord

	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// store record in-memory for now and return hash
	hash, err := services.SaveAndReturnHash(record)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to store medical record",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Medical record created",
		"hash":    hash,
	})
}

func GetMedicalRecords(c *gin.Context) {
	wallet := c.GetHeader("X-Wallet-Address")
	utils.Logger.WithField("wallet", wallet).Info("GetMedicalRecords called")
	records := services.GetAllMedicalRecords()
	c.JSON(http.StatusOK, gin.H{"data": records})
}
