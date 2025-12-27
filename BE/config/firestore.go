package config

import (
	"context"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"

	"be/utils"
)

var FirestoreClient *firestore.Client

func InitFirestore(app *firebase.App) *firestore.Client {
	if app == nil {
		return nil
	}

	ctx := context.Background()

	client, err := app.Firestore(ctx)
	if err != nil {
		utils.Logger.WithField("error", err).Warn("Firestore initialization failed")
		return nil
	}

	FirestoreClient = client
	utils.Logger.Info("✅ Firestore connected")
	return client
}
