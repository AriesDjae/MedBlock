package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"be/models"
	"be/services"
)

func CreateMedicalRecord(c *gin.Context) {
	var record models.MedicalRecord

	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	hash, err := services.CreateMedicalRecord(record)
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
