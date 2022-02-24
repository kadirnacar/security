package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
)

func main() {

	suuid := os.Args[1]
	sdp := os.Args[2]
	url := os.Args[3]

	result := fmt.Sprintf(`{ "server" : { "ice_servers": ["stun:stun.l.google.com:19302"] }, "streams" : { "%s": { "url" : "%s", "disable_audio": true, "on_demand": false } } }`, suuid, url)

	loadConfig2(result)

	go serveStreams()

	go HTTPAPIServerStreamWebRTC(suuid, sdp)

	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigs
		log.Println(sig)
		done <- true
	}()
	log.Println("Server Start Awaiting Signal")
	<-done
	log.Println("Exiting")
}
