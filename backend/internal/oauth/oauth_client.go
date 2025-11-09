package oauth

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

var sandboxBase = "https://vbank.open.bankingapi.ru" // default

func init() {
	if v := os.Getenv("SANDBOX_BASE_URL"); v != "" {
		sandboxBase = v
	}
}

// TokenResponse упрощённо
type TokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
	ConsentID   string `json:"consent_id"`
	CreatedAt   time.Time

	// EncryptedToken хранится в БД
	EncryptedToken []byte
	ExpiresAt      time.Time
}

func ExchangeCode(code string) (*TokenResponse, error) {
	clientID := os.Getenv("OAUTH_CLIENT_ID")
	secret := os.Getenv("OAUTH_CLIENT_SECRET")
	redirect := os.Getenv("OAUTH_REDIRECT_URL")

	reqBody := map[string]string{
		"grant_type":    "authorization_code",
		"code":          code,
		"redirect_uri":  redirect,
		"client_id":     clientID,
		"client_secret": secret,
	}
	b, _ := json.Marshal(reqBody)
	resp, err := http.Post(sandboxBase+"/oauth/token", "application/json", bytes.NewReader(b))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		// Логируем ошибку для отладки
		log.Printf("OAuth token exchange failed: status=%d, body=%s", resp.StatusCode, string(body))
		return nil, fmt.Errorf("oauth token exchange failed: status %d, %s", resp.StatusCode, string(body))
	}
	var tr struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int    `json:"expires_in"`
		ConsentID   string `json:"consent_id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tr); err != nil {
		return nil, err
	}
	res := &TokenResponse{AccessToken: tr.AccessToken, ExpiresIn: tr.ExpiresIn, ConsentID: tr.ConsentID, CreatedAt: time.Now()}
	res.ExpiresAt = res.CreatedAt.Add(time.Second * time.Duration(res.ExpiresIn))
	// зашифруем токен
	encrypted, err := encrypt([]byte(tr.AccessToken))
	if err != nil {
		return nil, err
	}
	res.EncryptedToken = encrypted
	return res, nil
}

// FetchAccounts вызывает sandbox endpoint /accounts
func FetchAccounts(accessToken string) ([]struct {
	AccountID, Mask string
	Balance         float64
	Currency        string
}, error) {
	req, _ := http.NewRequest("GET", sandboxBase+"/accounts", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	cli := &http.Client{Timeout: 10 * time.Second}
	resp, err := cli.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		b, _ := io.ReadAll(resp.Body)
		// Логируем ошибку для отладки
		log.Printf("Fetch accounts failed: status=%d, body=%s", resp.StatusCode, string(b))
		return nil, fmt.Errorf("fetch accounts failed: status %d, %s", resp.StatusCode, string(b))
	}
	var body struct {
		Accounts []struct {
			AccountID, Mask string
			Balance         float64
			Currency        string
		} `json:"accounts"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return nil, err
	}
	return body.Accounts, nil
}

// Simple AES-GCM encryption for demo — real prod: KMS
func encrypt(plaintext []byte) ([]byte, error) {
	keyB := os.Getenv("ENCRYPTION_KEY")
	if len(keyB) != 32 {
		return nil, errors.New("ENCRYPTION_KEY must be 32 bytes")
	}
	key := []byte(keyB)
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	nonce := make([]byte, aesgcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}
	ct := aesgcm.Seal(nonce, nonce, plaintext, nil)
	return []byte(base64.StdEncoding.EncodeToString(ct)), nil
}

func DecryptToken(enc []byte) (*TokenResponse, error) {
	// for demo: decrypt and return simple struct with AccessToken
	keyB := os.Getenv("ENCRYPTION_KEY")
	if len(keyB) != 32 {
		return nil, errors.New("ENCRYPTION_KEY must be 32 bytes")
	}
	key := []byte(keyB)
	ct, err := base64.StdEncoding.DecodeString(string(enc))
	if err != nil {
		return nil, err
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	nonceSize := aesgcm.NonceSize()
	if len(ct) < nonceSize {
		return nil, errors.New("ciphertext too short")
	}
	nonce, ciphertext := ct[:nonceSize], ct[nonceSize:]
	pt, err := aesgcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}
	return &TokenResponse{AccessToken: string(pt)}, nil
}
