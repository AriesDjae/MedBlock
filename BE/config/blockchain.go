package config

import (
	"context"
	"os"

	"github.com/ethereum/go-ethereum/ethclient"

	"be/utils"
)

var EthClient *ethclient.Client

func InitBlockchain() {
	rpc := os.Getenv("RPC_URL")

	if rpc == "" {
		utils.Logger.Warn("RPC_URL not set — skipping blockchain initialization. Set RPC_URL in BE/.env to enable Ethereum connection.")
		return
	}

	client, err := ethclient.DialContext(context.Background(), rpc)
	if err != nil {
		utils.Logger.WithField("error", err).Fatal("Blockchain connection failed")
	}

	EthClient = client
	utils.Logger.Info("✅ Connected to Ethereum")
}
