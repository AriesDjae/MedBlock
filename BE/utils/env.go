package utils

import "os"

// GetEnv returns the environment variable value or the provided default
func GetEnv(key, def string) string {
    v := os.Getenv(key)
    if v == "" {
        return def
    }
    return v
}
