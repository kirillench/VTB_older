package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"multibank/internal/db"
)

// GetSubscription возвращает информацию о подписке пользователя
func GetSubscription(c *gin.Context) {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var subscription db.Subscription
	if err := db.DB.Where("user_id = ?", userID).First(&subscription).Error; err != nil {
		// Если подписки нет, возвращаем бесплатный тариф
		c.JSON(http.StatusOK, gin.H{
			"plan":      "free",
			"startedAt": nil,
			"features":  getFreeFeatures(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"plan":      subscription.Plan,
		"startedAt": subscription.StartedAt,
		"features":  getFeaturesByPlan(subscription.Plan),
	})
}

// CreateSubscription создает подписку для пользователя
func CreateSubscription(c *gin.Context) {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var body struct {
		Plan string `json:"plan" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Проверяем валидность плана
	validPlans := map[string]bool{
		"free":     true,
		"premium":  true,
		"business": true,
	}
	if !validPlans[body.Plan] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid plan"})
		return
	}

	// Создаем или обновляем подписку
	var subscription db.Subscription
	if err := db.DB.Where("user_id = ?", userID).First(&subscription).Error; err != nil {
		// Создаем новую подписку
		subscription = db.Subscription{
			UserID:    userID,
			Plan:      body.Plan,
			StartedAt: time.Now(),
		}
		if err := db.DB.Create(&subscription).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create subscription"})
			return
		}
	} else {
		// Обновляем существующую подписку
		subscription.Plan = body.Plan
		subscription.StartedAt = time.Now()
		if err := db.DB.Save(&subscription).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update subscription"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"id":        subscription.ID,
		"plan":      subscription.Plan,
		"startedAt": subscription.StartedAt,
		"features":  getFeaturesByPlan(subscription.Plan),
	})
}

// Вспомогательные функции

func getFreeFeatures() []string {
	return []string{
		"До 2 подключенных банков",
		"Базовая аналитика",
		"История транзакций за 30 дней",
		"Ограниченные графики",
	}
}

func getFeaturesByPlan(plan string) []string {
	switch plan {
	case "premium":
		return []string{
			"Неограниченное количество банков",
			"Расширенная аналитика",
			"Полная история транзакций",
			"Экспорт данных",
			"Персонализированные рекомендации",
			"Приоритетная поддержка",
		}
	case "business":
		return []string{
			"Все функции Premium",
			"API доступ",
			"Многопользовательский доступ",
			"Расширенная отчетность",
			"Интеграция с бухгалтерскими системами",
		}
	default:
		return getFreeFeatures()
	}
}
