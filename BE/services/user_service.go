package services

import (
	"context"
	"errors"
	"strings"
	"time"

	"be/config"
	"be/models"
	"be/utils"

	"cloud.google.com/go/firestore"
)

var userStore map[string]models.User
var userNonces map[string]string

func init() {
    userStore = make(map[string]models.User)
    userNonces = make(map[string]string)
}

func RegisterUser(u models.User) error {
    wallet := u.Wallet
    if wallet == "" {
        return errors.New("wallet required")
    }

    // persist to firestore if available — use wallet as doc ID
    if config.FirestoreClient != nil {
        ctx := context.Background()
        docRef := config.FirestoreClient.Collection("users").Doc(strings.ToLower(wallet))
        _, err := docRef.Set(ctx, map[string]interface{}{
            "wallet":     wallet,
            "name":       u.Name,
            "role":       u.Role,
            "created_at": firestore.ServerTimestamp,
            "last_login": firestore.ServerTimestamp,
            "nonce":      "",
        })
        if err != nil {
            utils.Logger.WithField("wallet", wallet).WithField("error", err).Warn("failed to persist user to firestore; using in-memory store")
        } else {
            utils.Logger.WithField("wallet", wallet).Info("persisted user to firestore")
        }
    }

    userStore[wallet] = u
    utils.Logger.WithField("wallet", wallet).Info("user registered (in-memory)")
    return nil
}

func GetUserByWallet(wallet string) (models.User, bool) {
    // Try Firestore first if available
    if config.FirestoreClient != nil {
        ctx := context.Background()
        doc := config.FirestoreClient.Collection("users").Doc(strings.ToLower(wallet))
        snap, err := doc.Get(ctx)
        if err == nil && snap.Exists() {
            var data map[string]interface{}
            if err := snap.DataTo(&data); err == nil {
                var u models.User
                if v, ok := data["wallet"].(string); ok {
                    u.Wallet = v
                }
                if v, ok := data["name"].(string); ok {
                    u.Name = v
                }
                if v, ok := data["role"].(string); ok {
                    u.Role = v
                }
                if v, ok := data["created_at"].(time.Time); ok {
                    u.CreatedAt = v
                }
                return u, true
            }
        }
    }

    // Fallback to in-memory store
    u, ok := userStore[wallet]
    return u, ok
}

func UpdateLastLogin(wallet string) error {
    if config.FirestoreClient == nil {
        return nil
    }
    ctx := context.Background()
    doc := config.FirestoreClient.Collection("users").Doc(strings.ToLower(wallet))
    _, err := doc.Update(ctx, []firestore.Update{{Path: "last_login", Value: firestore.ServerTimestamp}})
    if err != nil {
        utils.Logger.WithField("wallet", wallet).WithField("error", err).Warn("failed to update last_login in firestore")
    }
    return err
}

// SetNonce stores a login nonce for a wallet (in Firestore and in-memory fallback)
func SetNonce(wallet string, nonce string) error {
    if wallet == "" {
        return errors.New("wallet required")
    }
    if config.FirestoreClient != nil {
        ctx := context.Background()
        doc := config.FirestoreClient.Collection("users").Doc(strings.ToLower(wallet))
        _, err := doc.Set(ctx, map[string]interface{}{"nonce": nonce}, firestore.MergeAll)
        if err != nil {
            utils.Logger.WithField("wallet", wallet).WithField("error", err).Warn("failed to set nonce in firestore; using in-memory")
        }
    }

    userNonces[wallet] = nonce
    return nil
}

// GetNonce retrieves the stored nonce for a wallet
func GetNonce(wallet string) (string, bool) {
    if wallet == "" {
        return "", false
    }
    if config.FirestoreClient != nil {
        ctx := context.Background()
        doc := config.FirestoreClient.Collection("users").Doc(strings.ToLower(wallet))
        snap, err := doc.Get(ctx)
        if err == nil && snap.Exists() {
            data := snap.Data()
            if v, ok := data["nonce"].(string); ok {
                return v, true
            }
        }
    }

    if n, ok := userNonces[wallet]; ok {
        return n, true
    }
    return "", false
}
