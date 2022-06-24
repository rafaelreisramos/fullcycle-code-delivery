package kafka

import (
	"encoding/json"
	"log"
	"os"
	"time"

	Route "code-delivery/simulator/application/route"
	"code-delivery/simulator/infra/kafka"

	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
)

//{"routeId":"2","clientId":"2"}
func Produce(msg *ckafka.Message) {
	producer := kafka.NewKafkaProducer()
	route := Route.NewRoute()
	json.Unmarshal(msg.Value, &route)
	route.LoadPositions()
	positions, err := route.ExportJsonPositions()
	if err != nil {
		log.Println(err.Error())
	}
	for _, p := range positions {
		kafka.Publish(p, os.Getenv("KafkaProduceTopic"), producer)
		time.Sleep(time.Millisecond * 500)
	}
}