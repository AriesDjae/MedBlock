package utils

import (
	"io"
	"os"

	log "github.com/sirupsen/logrus"
)

var Logger *log.Logger

func InitLogger() {
    logger := log.New()
    logger.SetFormatter(&log.JSONFormatter{})

    // create logs directory if not exists
    _ = os.MkdirAll("logs", 0o755)

    file, err := os.OpenFile("logs/medblock.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
    if err != nil {
        // fallback to stdout only
        logger.Out = os.Stdout
        Logger = logger
        return
    }

    // write to both file and stdout
    mw := io.MultiWriter(os.Stdout, file)
    logger.SetOutput(mw)

    Logger = logger
}
