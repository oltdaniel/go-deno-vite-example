package controllers

import (
	"encoding/json"
	"fmt"
	"helloworld/pkgs/models"
	"helloworld/pkgs/utils"
	"net/http"
)

func GETPing(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "pong")
}

func GETRandom(w http.ResponseWriter, r *http.Request) {
	randomHex, _ := utils.RandomHex(16)
	fmt.Fprint(w, randomHex)
}

func GETMessage(w http.ResponseWriter, r *http.Request) {
	fail := func(err error) {
		http.Error(w, err.Error(), 500)
	}

	message, err := models.NewRandomMessage()
	if err != nil {
		fail(err)
		return
	}

	w.Header().Add("Conent-Type", "application/json")
	err = json.NewEncoder(w).Encode(message)

	if err != nil {
		fail(err)
		return
	}
}
