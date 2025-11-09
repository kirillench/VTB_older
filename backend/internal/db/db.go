package db

import (
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func MustInit() *gorm.DB {
	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		// Fallback to DATABASE_URL for compatibility
		dsn = os.Getenv("DATABASE_URL")
	}
	if dsn == "" {
		log.Fatal("DATABASE_DSN or DATABASE_URL is required")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect db: %v", err)
	}

	// automigrate
	err = db.AutoMigrate(&User{}, &UserBank{}, &Account{}, &Transaction{}, &Subscription{})
	if err != nil {
		log.Fatalf("auto migrate failed: %v", err)
	}

	DB = db
	return db
}

// CloseDB закрывает соединение с базой данных
func CloseDB(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// Re-declare minimal models here to avoid import cycles in this file
// (real project: define in models package)

type User struct {
	ID        uint   `gorm:"primaryKey"`
	Email     string `gorm:"uniqueIndex;not null"`
	Password  string `gorm:"not null"`
	CreatedAt time.Time
}

type UserBank struct {
	ID             uint   `gorm:"primaryKey"`
	UserID         uint   `gorm:"index"`
	BankSlug       string `gorm:"index"`
	ConsentID      string
	EncryptedToken []byte
	TokenExpiry    time.Time
	CreatedAt      time.Time
}

type Account struct {
	ID         uint   `gorm:"primaryKey"`
	UserBankID uint   `gorm:"index"`
	AccountID  string `gorm:"index"`
	Mask       string
	Balance    float64
	Currency   string
}

type Transaction struct {
	ID        uint   `gorm:"primaryKey"`
	AccountID uint   `gorm:"index"`
	TxID      string `gorm:"index"`
	Amount    float64
	Currency  string
	Timestamp time.Time
	Category  string
	Merchant  string
	Raw       string `gorm:"type:jsonb"`
}

type Subscription struct {
	ID        uint
	UserID    uint
	Plan      string
	StartedAt time.Time
}
