package handlers

import (
	"fmt"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"multibank/internal/db"
	"multibank/internal/oauth"
	"net/http"
	"net/url"
	"os"
)

// ListBanks — статичный список банков (в реальном проекте — динамически из registry)
func ListBanks(c *gin.Context) {
	banks := []gin.H{
		{"slug": "vbank", "name": "VBank (sandbox)"},
		{"slug": "sbank", "name": "SBank (sandbox)"},
	}
	c.JSON(http.StatusOK, banks)
}

// ConnectBank — создаёт consent request и возвращает redirect URL
func ConnectBank(c *gin.Context) {
	_ = c.Param("bank")                  // bank parameter (может использоваться для выбора конкретного банка)
	userID := c.GetHeader("X-Demo-User") // DEMO: в header передаем user id
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "X-Demo-User header required for demo"})
		return
	}

	// Build auth URL for sandbox OAuth
	clientID := os.Getenv("OAUTH_CLIENT_ID")
	redirect := os.Getenv("OAUTH_REDIRECT_URL")
	authURL := fmt.Sprintf("%s/oauth/authorize?response_type=code&client_id=%s&redirect_uri=%s&state=%s", os.Getenv("SANDBOX_BASE_URL"), url.QueryEscape(clientID), url.QueryEscape(redirect), "demo-state")

	c.JSON(http.StatusOK, gin.H{"auth_url": authURL})
}

// ConnectCallback — получает code, меняет на token и сохраняет
func ConnectCallback(c *gin.Context) {
	code := c.Query("code")
	_ = c.Query("state") // state parameter (может использоваться для проверки CSRF)
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing code"})
		return
	}

	// Exchange code for token at sandbox
	tokenResp, err := oauth.ExchangeCode(code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token exchange failed"})
		return
	}

	// Для демо сохраним UserBank грубо: user id берем из state или header
	userID := uint(1)
	ub := db.UserBank{UserID: userID, BankSlug: "vbank", ConsentID: tokenResp.ConsentID, EncryptedToken: tokenResp.EncryptedToken, TokenExpiry: tokenResp.ExpiresAt}
	db.DB.Create(&ub)

	c.JSON(http.StatusOK, gin.H{"ok": true, "consent_id": tokenResp.ConsentID, "expires": tokenResp.ExpiresAt})
}

// SyncUserBank — пример фонового сбора (sync accounts & transactions)
func SyncUserBank(c *gin.Context) {
	ubid := c.Param("userbank")
	// Найдем UserBank
	var ub db.UserBank
	if err := db.DB.Where("id = ?", ubid).First(&ub).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "userbank not found"})
		return
	}

	// Проверяем срок действия токена
	if ub.TokenExpiry.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "token expired",
			"message": "Токен доступа истек. Необходимо переподключить банк.",
		})
		return
	}

	// Дешифруем токен
	tok, err := oauth.DecryptToken(ub.EncryptedToken)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "decrypt token",
			"message": "Ошибка расшифровки токена. Попробуйте переподключить банк.",
		})
		return
	}

	// Запрос балансов с обработкой ошибок
	accounts, err := oauth.FetchAccounts(tok.AccessToken)
	if err != nil {
		// Проверяем тип ошибки
		errMsg := err.Error()
		if contains(errMsg, "401") || contains(errMsg, "unauthorized") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "Токен доступа недействителен. Необходимо переподключить банк.",
			})
			return
		}
		if contains(errMsg, "429") || contains(errMsg, "rate limit") {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "rate limit",
				"message": "Превышен лимит запросов. Попробуйте позже.",
			})
			return
		}
		if contains(errMsg, "503") || contains(errMsg, "unavailable") {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error":   "service unavailable",
				"message": "Сервис банка временно недоступен. Попробуйте позже.",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "fetch accounts",
			"message": "Ошибка при получении данных от банка. Попробуйте позже.",
		})
		return
	}

	// Сохраним
	for _, a := range accounts {
		dbAcc := db.Account{UserBankID: ub.ID, AccountID: a.AccountID, Mask: a.Mask, Balance: a.Balance, Currency: a.Currency}
		db.DB.Where("account_id = ?", a.AccountID).Assign(dbAcc).FirstOrCreate(&dbAcc)
	}

	c.JSON(http.StatusOK, gin.H{"ok": true, "count": len(accounts)})
}

// GetAccounts
func GetAccounts(c *gin.Context) {
	// DEMO: возвращаем все аккаунты
	var accs []db.Account
	db.DB.Find(&accs)
	c.JSON(http.StatusOK, accs)
}

// GetAccountTransactions возвращает транзакции конкретного счета
func GetAccountTransactions(c *gin.Context) {
	id := c.Param("id")
	var acc db.Account
	if err := db.DB.Where("id = ?", id).First(&acc).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "account not found"})
		return
	}
	var txs []db.Transaction
	db.DB.Where("account_id = ?", acc.ID).Find(&txs)
	c.JSON(http.StatusOK, txs)
}

// Вспомогательная функция для проверки подстроки
func contains(s, substr string) bool {
	return strings.Contains(strings.ToLower(s), strings.ToLower(substr))
}
