package utils

import (
	"encoding/hex"
	"errors"
	"strconv"
	"strings"

	"github.com/ethereum/go-ethereum/crypto"
)

func VerifySignature(message, signature string) (string, error) {
	if signature[:2] == "0x" {
		signature = signature[2:]
	}

	sig, err := hex.DecodeString(signature)
	if err != nil {
		return "", err
	}

	if sig[64] !=27 && sig[64] != 28 {
		return "", errors.New("invalid signature recovery id")
	}

	sig[64] -= 27

	prefix := "\x19Ethereum Signed Message:\n" + strconv.Itoa(len(message))
	msg := crypto.Keccak256Hash([]byte(prefix + message))

	pubKey, err := crypto.SigToPub(msg.Bytes(), sig)
	if err != nil {
		return "", err
	}

	address := crypto.PubkeyToAddress(*pubKey)
	return strings.ToLower(address.Hex()), nil
}