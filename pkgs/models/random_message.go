package models

import "helloworld/pkgs/utils"

type RandomMessage struct {
	Message string `json:"message"`
}

func NewRandomMessage() (*RandomMessage, error) {
	randomString, err := utils.RandomHex(16)
	if err != nil {
		return nil, err
	}
	return &RandomMessage{Message: randomString}, nil
}

func (m *RandomMessage) NewMessage() error {
	randomString, err := utils.RandomHex(16)
	if err != nil {
		return err
	}
	m.Message = randomString
	return nil
}
