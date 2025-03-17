package main

import (
	"helloworld/internal/controllers"
	"helloworld/internal/middlewares"
	"log"
	"net/http"
	"time"
)

func main() {
	handler := http.NewServeMux()

	handler.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir("./web/dist/assets"))))

	handler.HandleFunc("/", controllers.GETHome)
	handler.HandleFunc("/api", controllers.GETAPI)
	handler.HandleFunc("/game", controllers.GETGame)
	handler.HandleFunc("/golayout", controllers.GETGoLayout)

	handler.HandleFunc("/api/ping", controllers.GETPing)
	handler.HandleFunc("/api/message", controllers.GETMessage)
	handler.Handle("/api/random", middlewares.RandomMiddleware(http.HandlerFunc(controllers.GETRandom)))

	s := &http.Server{
		Addr:           ":8080",
		Handler:        handler,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	log.Fatal(s.ListenAndServe())
}
