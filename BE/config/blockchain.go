package config

import (
	"context"
	"log"
	"os"

	"github.com/ethereum/go-ethereum/ethclient"
)

var EthClient *ethclient.Client

func InitBlockchain() {
	rpc := os.Getenv("RPC_URL")

	client, err := ethclient.DialContext(context.Background(), rpc)
	if err != nil {
		log.Fatal("Blockchain connection failed:", err)
	}

	EthClient = client
	log.Println("✅ Connected to Ethereum")
}
