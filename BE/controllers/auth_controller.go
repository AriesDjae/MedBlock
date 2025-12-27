package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"

	"be/models"
	"be/services"
	"be/utils"
)

type AuthRequest struct {
    Name string `json:"name"`
}

type NonceRequest struct {
    Wallet string `json:"wallet"`
}

// RequestNonce returns a server-generated nonce for the given wallet. Client must sign this nonce and send it to /api/login
func RequestNonce(c *gin.Context) {
    var nr NonceRequest
    if err := c.ShouldBindJSON(&nr); err != nil || nr.Wallet == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "wallet required"})
        return
    }

    // generate random nonce
    b := make([]byte, 16)
    if _, err := rand.Read(b); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "failed generate nonce"})
        return
    }
    nonce := hex.EncodeToString(b)
    wallet := strings.ToLower(nr.Wallet)
    if err := services.SetNonce(wallet, nonce); err != nil {
        utils.Logger.WithField("wallet", wallet).WithField("error", err).Warn("failed to store nonce")
    }

    c.JSON(http.StatusOK, gin.H{"nonce": nonce})
}

// Register handles user registration via signed message. Expects X-Message and X-Signature headers.
func Register(c *gin.Context) {
    // verify signature
    message := c.GetHeader("X-Message")
    signature := c.GetHeader("X-Signature")
    if message == "" || signature == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "message and signature required"})
        return
    }

    wallet, err := utils.VerifySignature(message, signature)
    if err != nil {
        utils.Logger.WithField("error", err).Warn("invalid signature on register")
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid signature"})
        return
    }

    var body AuthRequest
    _ = c.ShouldBindJSON(&body)

    user := models.User{Wallet: wallet, Role: "patient", Name: body.Name}
    if err := services.RegisterUser(user); err != nil {
        utils.Logger.WithField("wallet", wallet).WithField("error", err).Error("failed register")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "registration failed"})
        return
    }

    utils.Logger.WithField("wallet", wallet).Info("user registered")
    c.JSON(http.StatusOK, gin.H{"message": "registered", "wallet": wallet})
}

// Login verifies signature and returns user info if exists.
func Login(c *gin.Context) {
    message := c.GetHeader("X-Message")
    signature := c.GetHeader("X-Signature")
    if message == "" || signature == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "message and signature required"})
        return
    }

    wallet, err := utils.VerifySignature(message, signature)
    if err != nil {
        utils.Logger.WithField("error", err).Warn("invalid signature on login")
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid signature"})
        return
    }

    // check stored nonce (must match message)
    if stored, ok := services.GetNonce(strings.ToLower(wallet)); ok {
        if stored == "" || stored != message {
            utils.Logger.WithField("wallet", wallet).Warn("nonce mismatch or expired")
            c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired nonce"})
            return
        }
    } else {
        utils.Logger.WithField("wallet", wallet).Warn("no nonce found for wallet")
        c.JSON(http.StatusBadRequest, gin.H{"error": "please request nonce before login"})
        return
    }

    if u, ok := services.GetUserByWallet(wallet); ok {
        utils.Logger.WithField("wallet", wallet).Info("user login successful")

        // clear nonce
        _ = services.SetNonce(strings.ToLower(wallet), "")

        // update last_login in firestore if available
        _ = services.UpdateLastLogin(wallet)

        // create JWT
        secret := os.Getenv("JWT_SECRET")
        if secret == "" {
            secret = "dev_secret_change_me"
        }

        claims := jwt.MapClaims{
            "wallet": wallet,
            "role":   u.Role,
            "exp":    time.Now().Add(24 * time.Hour).Unix(),
        }

        token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
        signed, err := token.SignedString([]byte(secret))
        if err != nil {
            utils.Logger.WithField("error", err).Error("failed create jwt")
            c.JSON(http.StatusInternalServerError, gin.H{"error": "failed create token"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"wallet": wallet, "user": u, "token": signed})
        return
    }

    utils.Logger.WithField("wallet", wallet).Info("user not found on login")
    c.JSON(http.StatusNotFound, gin.H{"error": "user not registered"})
}
