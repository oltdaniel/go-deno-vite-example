package middlewares

import (
	"helloworld/pkgs/utils"
	"net/http"
)

func RandomMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		randomHex, _ := utils.RandomHex(16)
		w.Header().Add("X-Random", randomHex)
		next.ServeHTTP(w, r)
	})
}
