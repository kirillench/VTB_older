package main

import (
	"log"
	"os"

	"multibank/internal/db"
	"multibank/internal/handlers"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Загружаем .env из корня backend или из текущей директории
	if err := godotenv.Load("../.env"); err != nil {
		if err := godotenv.Load("../../.env"); err != nil {
			if err := godotenv.Load(".env"); err != nil {
				log.Println("No .env file loaded, reading env from system")
			}
		}
	}

	// init DB
	dbConn := db.MustInit()
	defer func() {
		if err := db.CloseDB(dbConn); err != nil {
			log.Printf("Error closing database: %v", err)
		}
	}()

	r := gin.Default()

	api := r.Group("/api")
	{
		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)

		api.GET("/banks", handlers.ListBanks)
		api.POST("/connect/:bank", handlers.ConnectBank)
		api.GET("/connect/callback", handlers.ConnectCallback)

		api.POST("/sync/:userbank", handlers.SyncUserBank)
		api.GET("/accounts", handlers.GetAccounts)
		api.GET("/accounts/:id/transactions", handlers.GetAccountTransactions)

		// Dashboard endpoints
		api.GET("/dashboard/summary", handlers.GetFinancialSummary)
		api.GET("/dashboard/transactions", handlers.GetTransactions)
		api.GET("/dashboard/analytics", handlers.GetSpendingAnalytics)

		// Subscription endpoints
		api.GET("/subscription", handlers.GetSubscription)
		api.POST("/subscription", handlers.CreateSubscription)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on :%s", port)
	r.Run(":" + port)
}
