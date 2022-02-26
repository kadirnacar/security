package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	webrtc "github.com/deepch/vdk/format/webrtcv3"
)

type JCodec struct {
	Type string
}

func HTTPAPIServerStreamWebRTC(suuid string, data string) {
	if !Config.ext(suuid) {
		log.Println("Stream Not Found")
		return
	}
	Config.RunIFNotRun(suuid)
	codecs := Config.coGe(suuid)
	if codecs == nil {
		log.Println("Stream Codec Not Found")
		return
	}
	var AudioOnly bool
	if len(codecs) == 1 && codecs[0].Type().IsAudio() {
		AudioOnly = true
	}
	muxerWebRTC := webrtc.NewMuxer(webrtc.Options{ICEServers: Config.GetICEServers(), ICEUsername: Config.GetICEUsername(), ICECredential: Config.GetICECredential(), PortMin: Config.GetWebRTCPortMin(), PortMax: Config.GetWebRTCPortMax()})
	answer, err := muxerWebRTC.WriteHeader(codecs, data)
	if err != nil {
		log.Println("WriteHeader", err)
		return
	}

	mapD := map[string]string{"answer": answer}
	mapB, _ := json.Marshal(mapD)
	fmt.Println(string(mapB))

	if err != nil {
		log.Println("Write", err)
		return
	}
	go func() {
		cid, ch := Config.clAd(suuid)
		defer Config.clDe(suuid, cid)
		defer muxerWebRTC.Close()
		var videoStart bool
		noVideo := time.NewTimer(10 * time.Second)
		for {
			select {
			case <-noVideo.C:
				log.Println("noVideo")
				return
			case pck := <-ch:
				if pck.IsKeyFrame || AudioOnly {
					noVideo.Reset(10 * time.Second)
					videoStart = true
				}
				if !videoStart && !AudioOnly {
					continue
				}
				err = muxerWebRTC.WritePacket(pck)
				if err != nil {
					log.Println("WritePacket", err)
					mapErr := map[string]string{"error": err.Error()}
					mapErrJ, _ := json.Marshal(mapErr)
					fmt.Println(string(mapErrJ))
					os.Exit(3)
					return
				}
			}
		}
	}()
}

type Response struct {
	Tracks []string `json:"tracks"`
	Sdp64  string   `json:"sdp64"`
}

type ResponseError struct {
	Error string `json:"error"`
}
