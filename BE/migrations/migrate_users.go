package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/option"
)

func main() {
	ctx := context.Background()
	cred := "config/firebase.json"
	if v := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"); v != "" {
		cred = v
	}
	if _, err := os.Stat(cred); os.IsNotExist(err) {
		log.Fatalf("service account file not found: %s", cred)
	}

	client, err := firestore.NewClient(ctx, "", option.WithCredentialsFile(cred))
	if err != nil {
		log.Fatalf("failed to create firestore client: %v", err)
	}
	defer client.Close()

	// load seed file
	raw, err := ioutil.ReadFile("data/users_seed.json")
	if err != nil {
		log.Fatalf("failed read seed: %v", err)
	}

	var users []map[string]interface{}
	if err := json.Unmarshal(raw, &users); err != nil {
		log.Fatalf("invalid seed json: %v", err)
	}

	for _, u := range users {
		wallet, _ := u["wallet"].(string)
		if wallet == "" {
			fmt.Println("skipping user with missing wallet")
			continue
		}
		doc := client.Collection("users").Doc(strings.ToLower(wallet))
		_, err := doc.Set(ctx, map[string]interface{}{
			"wallet":     wallet,
			"name":       u["name"],
			"role":       u["role"],
			"created_at": firestore.ServerTimestamp,
			"last_login": firestore.ServerTimestamp,
			"nonce":      "",
		})
		if err != nil {
			fmt.Printf("failed to write %s: %v\n", wallet, err)
		} else {
			fmt.Printf("wrote %s\n", wallet)
		}
		// small delay
		time.Sleep(200 * time.Millisecond)
	}

	fmt.Println("migration complete")
}
