package controllers

import (
	"net/http"

	"github.com/gofiber/template/html/v2"
)

var templateEngine = html.New("./web/dist/views", ".html")

func GETHome(w http.ResponseWriter, r *http.Request) {
	err := templateEngine.Render(w, "pages/index", map[string]any{
		"Title": "Index",
	})
	if err != nil {
		http.Error(w, err.Error(), 500)
	}
}

func GETGame(w http.ResponseWriter, r *http.Request) {
	err := templateEngine.Render(w, "pages/game", map[string]any{
		"Title": "Game",
	})
	if err != nil {
		http.Error(w, err.Error(), 500)
	}
}

func GETAPI(w http.ResponseWriter, r *http.Request) {
	err := templateEngine.Render(w, "pages/api", map[string]any{
		"Title": "API",
	})
	if err != nil {
		http.Error(w, err.Error(), 500)
	}
}

func GETGoLayout(w http.ResponseWriter, r *http.Request) {
	err := templateEngine.Render(w, "pages/golayout", map[string]any{
		"Title": "GoLayout",
	}, "layouts/default")
	if err != nil {
		http.Error(w, err.Error(), 500)
	}
}
