package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"multibank/internal/db"
)

// GetFinancialSummary возвращает агрегированную финансовую информацию
func GetFinancialSummary(c *gin.Context) {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Получаем все счета пользователя
	var accounts []db.Account
	if err := db.DB.
		Joins("JOIN user_banks ON accounts.user_bank_id = user_banks.id").
		Where("user_banks.user_id = ?", userID).
		Find(&accounts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch accounts"})
		return
	}

	// Вычисляем общий баланс
	var totalBalance float64
	var predictedBalance float64
	accountList := make([]gin.H, 0)
	for _, acc := range accounts {
		totalBalance += acc.Balance
		predictedBalance += acc.Balance // Упрощенный прогноз
		accountList = append(accountList, gin.H{
			"id":        acc.ID,
			"accountId": acc.AccountID,
			"mask":      acc.Mask,
			"balance":   acc.Balance,
			"currency":  acc.Currency,
		})
	}

	// Получаем расходы по категориям за последний месяц
	categorySpending := getCategorySpending(userID, 30)

	// Получаем статус бюджетов
	budgetStatus := getBudgetStatus(userID)

	c.JSON(http.StatusOK, gin.H{
		"totalBalance":     totalBalance,
		"predictedBalance": predictedBalance,
		"accounts":         accountList,
		"categorySpending": categorySpending,
		"budgetStatus":     budgetStatus,
	})
}

// GetTransactions возвращает транзакции пользователя
func GetTransactions(c *gin.Context) {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	limit := c.DefaultQuery("limit", "10")
	offset := c.DefaultQuery("offset", "0")
	startDate := c.Query("startDate")
	endDate := c.Query("endDate")

	query := db.DB.
		Joins("JOIN accounts ON transactions.account_id = accounts.id").
		Joins("JOIN user_banks ON accounts.user_bank_id = user_banks.id").
		Where("user_banks.user_id = ?", userID)

	if startDate != "" {
		query = query.Where("transactions.timestamp >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("transactions.timestamp <= ?", endDate)
	}

	var transactions []db.Transaction
	if err := query.
		Order("transactions.timestamp DESC").
		Limit(parseInt(limit)).
		Offset(parseInt(offset)).
		Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch transactions"})
		return
	}

	transactionList := make([]gin.H, 0)
	for _, tx := range transactions {
		transactionList = append(transactionList, gin.H{
			"id":        tx.ID,
			"accountId": tx.AccountID,
			"amount":    tx.Amount,
			"currency":  tx.Currency,
			"timestamp": tx.Timestamp,
			"category":  tx.Category,
			"merchant":  tx.Merchant,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"transactions": transactionList,
		"count":        len(transactionList),
	})
}

// GetSpendingAnalytics возвращает аналитику расходов
func GetSpendingAnalytics(c *gin.Context) {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Получаем тренды за последние 6 месяцев
	monthlyTrends := getMonthlyTrends(userID, 6)

	// Получаем топ категории расходов
	topCategories := getTopCategories(userID, 5)

	c.JSON(http.StatusOK, gin.H{
		"monthlyTrends": monthlyTrends,
		"topCategories": topCategories,
	})
}

// Вспомогательные функции

func getUserIDFromContext(c *gin.Context) uint {
	// DEMO: получаем из header, в реальном проекте - из JWT
	userIDStr := c.GetHeader("X-User-ID")
	if userIDStr == "" {
		return 0
	}
	return parseUint(userIDStr)
}

func getCategorySpending(userID uint, days int) map[string]float64 {
	var transactions []db.Transaction
	startDate := time.Now().AddDate(0, 0, -days)

	db.DB.
		Joins("JOIN accounts ON transactions.account_id = accounts.id").
		Joins("JOIN user_banks ON accounts.user_bank_id = user_banks.id").
		Where("user_banks.user_id = ? AND transactions.timestamp >= ? AND transactions.amount < 0", userID, startDate).
		Find(&transactions)

	categorySpending := make(map[string]float64)
	for _, tx := range transactions {
		category := tx.Category
		if category == "" {
			category = "Другое"
		}
		categorySpending[category] += abs(tx.Amount)
	}

	return categorySpending
}

func getBudgetStatus(userID uint) []gin.H {
	// Упрощенная реализация - в реальном проекте будет таблица budgets
	return []gin.H{
		{
			"category": "Продукты",
			"limit":    15000,
			"spent":    12000,
			"percent":  80,
		},
		{
			"category": "Транспорт",
			"limit":    5000,
			"spent":    4500,
			"percent":  90,
		},
	}
}

func getMonthlyTrends(userID uint, months int) []gin.H {
	trends := make([]gin.H, 0)
	now := time.Now()

	for i := months - 1; i >= 0; i-- {
		monthStart := time.Date(now.Year(), now.Month()-time.Month(i), 1, 0, 0, 0, 0, now.Location())
		monthEnd := monthStart.AddDate(0, 1, -1)

		var totalSpending float64
		db.DB.
			Model(&db.Transaction{}).
			Joins("JOIN accounts ON transactions.account_id = accounts.id").
			Joins("JOIN user_banks ON accounts.user_bank_id = user_banks.id").
			Where("user_banks.user_id = ? AND transactions.timestamp >= ? AND transactions.timestamp <= ? AND transactions.amount < 0", userID, monthStart, monthEnd).
			Select("COALESCE(SUM(ABS(transactions.amount)), 0)").
			Scan(&totalSpending)

		trends = append(trends, gin.H{
			"month":    monthStart.Format("2006-01"),
			"spending": totalSpending,
		})
	}

	return trends
}

func getTopCategories(userID uint, limit int) []gin.H {
	var results []struct {
		Category string
		Total    float64
	}

	startDate := time.Now().AddDate(0, -1, 0)
	db.DB.
		Model(&db.Transaction{}).
		Joins("JOIN accounts ON transactions.account_id = accounts.id").
		Joins("JOIN user_banks ON accounts.user_bank_id = user_banks.id").
		Where("user_banks.user_id = ? AND transactions.timestamp >= ? AND transactions.amount < 0", userID, startDate).
		Select("COALESCE(transactions.category, 'Другое') as category, SUM(ABS(transactions.amount)) as total").
		Group("category").
		Order("total DESC").
		Limit(limit).
		Scan(&results)

	categories := make([]gin.H, 0)
	for _, r := range results {
		categories = append(categories, gin.H{
			"category": r.Category,
			"total":    r.Total,
		})
	}

	return categories
}

func parseInt(s string) int {
	val, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}
	return val
}

func parseUint(s string) uint {
	val, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		return 0
	}
	return uint(val)
}

func abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}
