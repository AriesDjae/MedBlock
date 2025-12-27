package config

import (
	"context"
	"os"

	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"

	"be/utils"
)

// InitFirebase menginisialisasi Firebase App menggunakan service account JSON.
// Returns nil if config/firebase.json is missing or initialization fails.
func InitFirebase() *firebase.App {
	if _, err := os.Stat("config/firebase.json"); err != nil {
		utils.Logger.WithField("error", err).Warn("firebase.json not found; skipping Firebase initialization")
		return nil
	}

	opt := option.WithCredentialsFile("config/firebase.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		utils.Logger.WithField("error", err).Warn("Error initializing Firebase; skipping")
		return nil
	}

	utils.Logger.Info("✅ Firebase connected")
	return app
}