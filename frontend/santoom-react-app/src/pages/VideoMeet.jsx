import React, { useState , useEffect , useRef } from 'react'
import { io } from 'socket.io-client';
import { Badge, Button, IconButton, TextField, Box, Paper, Typography } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare'
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import { useNavigate } from 'react-router-dom';
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers" : [
        { "urls" : "stun:stun.l.google.com:19302"}
    ]
}

export default function VideoMeetComponent() {

  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();

  let [videoAvailable , setVideoAvailable] = useState(true);
  let [audioAvailable , setAudioAvailable] = useState(true);
  let [video , setVideo] = useState([]);
  let [audio , setAudio] = useState();
  let [screen , setScreen] = useState();
  let [showModel , setShowModel] = useState(true);
  let [screenAvailable , setScreenAvailable] = useState();
  let [messages , setMessages] = useState([]);
  let [message , setMessage] = useState("");
  let [newMessages , setNewMessages] = useState(0);
  let [askForUsername , setAskForUsername] = useState(true);
  let [username , setUsername] = useState("");

  const videoRef = useRef([]);
  let [videos , setVideos] = useState([]);

  useEffect(() => {
    getPermissions();
  } , [])

  let getUserMediaSuccess = (stream) => {
     try{
        window.localStream.getTracks().forEach(track => track.stop())
     }catch(e){console.log(e)}

     window.localStream = stream;
     localVideoRef.current.srcObject = stream;

     for(let id in connections){
      if(id === socketIdRef.current) continue

      connections[id].addStream(window.localStream)

      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
        .then(() => {
          socketRef.current.emit('signal' , id , JSON.stringify({'sdp' :  connections[id].localDescription}))
        })
        .catch(e => console.log(e))
      }) 
     }

     stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false);
      setAudio(false);

      try{
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }catch(e){console.log(e)}

      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream;

      for(let id in connections){
        connections[id].addStream(window.localStream)
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal" , id , JSON.stringify({"sdp" : connections[id].localDescription}))
          })
          .catch(e => console.log(e));
        })
      }      
     })
  }

  let silence = () => {
    let ctx = new AudioContext()
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0] ,{enabled : false})
  }

  let black = ({width = 640 , height = 480} = {}) => {
    let canvas = Object.assign(document.createElement("canvas") , {width , height});
    canvas.getContext('2d').fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], {enabled : false})
  }

  let getUserMedia = () => {
    if((video && videoAvailable) || (audio && audioAvailable)){
      navigator.mediaDevices.getUserMedia({video : video , audio : audio})
      .then(getUserMediaSuccess) 
      .then((stream) => {})
      .catch((e) => console.log(e))
    } else{
      try{
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop())
      }catch(e) {}
    }
  }

  useEffect(() => {
    if(video !== undefined && audio !== undefined){
      getUserMedia();
    }
  } , [video , audio])

  // --- NEW FIX: Helper function to safely create connections ---
  const createConnection = (id) => {
    // Prevent overwriting existing connections (Fixes the 3rd user bug!)
    if (connections[id]) return; 

    connections[id] = new RTCPeerConnection(peerConfigConnections);

    connections[id].onicecandidate = (event) => {
      if(event.candidate != null){
        socketRef.current.emit("signal" , id , JSON.stringify({'ice' : event.candidate}))
      }
    }

    connections[id].onaddstream = (event) => {
      let videoExists = videoRef.current.find(video => video.socketId === id);

      if(videoExists){
        setVideos(videos => {
          const updatedVideos = videos.map(video => 
            video.socketId === id ? { ...video , stream : event.stream } : video
          );
          videoRef.current = updatedVideos;
          return updatedVideos;
        })
      }else{
        let newVideo = {
          socketId : id,
          stream : event.stream,
          autoPlay : true,
          playsinline : true
        }
        setVideos(videos => {
          const updatedVideos = [ ...videos , newVideo];
          videoRef.current = updatedVideos;
          return updatedVideos;
        })
      }
    };

    if(window.localStream !== undefined && window.localStream !== null){
      connections[id].addStream(window.localStream);
    }else{
      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      connections[id].addStream(window.localStream);
    }
  }

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
        createConnection(fromId);

        if (signal.sdp) {
            connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
                            }).catch(e => {}); // Silenced
                        }).catch(e => {}); // Silenced
                    }
                })
                .catch(e => {}); // Silenced - handles the m-lines collision silently
        }

        if (signal.ice) {
            if (connections[fromId].remoteDescription && connections[fromId].remoteDescription.type) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
                    .catch(e => {}); // Silenced
            } 
            // Removed the "else" warning entirely so it fails silently until ready
        }
    }
  }
  
  let addMessage = (data , sender , socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages , 
      {sender : sender , data : data}
    ]);

    if(socketIdSender !== socketIdRef.current){
      setNewMessages((prevNewMessages) => prevNewMessages + 1)
    }
  }

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, {secure : false})
    socketRef.current.on('signal' , gotMessageFromServer);

    socketRef.current.on('connect' , () => {
      socketRef.current.emit("join-call" , window.location.href)
      socketIdRef.current = socketRef.current.id
      socketRef.current.on("chat-message" , addMessage)

      socketRef.current.on("user-left" , (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id))
      })

      socketRef.current.on("user-joined" , (id , clients) => {
        clients.forEach((socketListId) => {
          if (socketListId !== socketIdRef.current) {
            // NEW FIX: Use the helper function so we don't break existing calls
            createConnection(socketListId);
          }
        })

        if(id === socketIdRef.current){
          for(let id2 in connections){
            if(id2 === socketIdRef.current) continue

            // NEW FIX: Removed the duplicate connections[id2].addStream(window.localStream) here!

            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description)
              .then(() => {
                socketRef.current.emit("signal" , id2 , JSON.stringify({"sdp" : connections[id2].localDescription}))
              })
              .catch(e => console.log(e))
            })
          }
        }
      })
    })
  }

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  }

  let routeTo = useNavigate();

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  }

  const getPermissions = async() => {
    try{
      const videoPermission = await navigator.mediaDevices.getUserMedia({video : true});
      if(videoPermission){ setVideoAvailable(true); } else{ setVideoAvailable(false); }

      const audioPermission = await navigator.mediaDevices.getUserMedia({audio : true});
      if(audioPermission){ setAudioAvailable(true); } else{ setAudioAvailable(false); }

      if(navigator.mediaDevices.getDisplayMedia){ setScreenAvailable(true); } else{ setScreenAvailable(false); }

      if(videoAvailable || audioAvailable){
        const userMediaStream = await navigator.mediaDevices.getUserMedia({video : videoAvailable , audio : audioAvailable});

        if(userMediaStream){
          window.localStream = userMediaStream;
          if(localVideoRef.current){
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    }catch (err){ console.log(err); }
  }

  let handleVideo = () => { setVideo(!video); }
  let handleAudio = () => { setAudio(!audio); }

  let getDisplayMediaSuccess = (stream) => {
    try{
      window.localStream.getTracks().forEach(track => track.stop())
    } catch (e){ console.log(e) }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for(let id in connections){
      if(id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream)
      connections[id].createOffer().then((description) => [
        connections[id].setLocalDescription(description)
        .then(() => {
          socketRef.current.emit("signal" , id , JSON.stringify({"sdp" : connections[id].localDescription}))
        })
        .catch((e) => console.log(e))
      ])
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false);

      try{
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }catch(e){console.log(e)}

      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream;
      getUserMedia();   
    })
  }

  let getDisplayMedia = () => {
    if(screen) {
      if(navigator.mediaDevices.getDisplayMedia){
        navigator.mediaDevices.getDisplayMedia({video : true , audio : true})
        .then(getDisplayMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e))
      }
    }
  }

  useEffect(() => {
    if(screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen])

  let handleScreen = () => { setScreen(!screen); }

  let sendMessage = () => {
    socketRef.current.emit("chat-message" , message , username);
    setMessage("");
  }

  let handleEndCall = () => {
    try{
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop())
    }catch(e){}
    routeTo("/home")
  }

  return (
    <div>
      {askForUsername === true ? 
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f4f8' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0px 10px 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '600px', width: '90%' }}>
            
            <h2 style={{ fontFamily: '"Inter", sans-serif', color: '#1e293b', marginTop: 0, marginBottom: '20px' }}>
              Ready to join?
            </h2>

            {/* VIDEO PREVIEW MIRROR */}
            <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#111', marginBottom: '25px', aspectRatio: '16/9', display: 'flex', justifyContent: 'center' }}>
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              ></video>
            </div>

            {/* INPUT & CONNECT BUTTON */}
            <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
              <TextField 
                fullWidth
                id="outlined-basic" 
                label="Enter your name" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                variant="outlined" 
              />
              <Button 
                variant='contained' 
                onClick={connect}
                disabled={!username} // Prevents joining without a name
                style={{ padding: '0 30px', fontWeight: 'bold', borderRadius: '8px' }}
              >
                Connect
              </Button>
            </div>

          </div>
        </div> 
        : 
        /* --- UPGRADED MEETING ROOM WITH DYNAMIC GRID & CHAT --- */
        <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#111827' }}>
          
          {/* LEFT SIDE: VIDEO GRID & CONTROLS */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            
            {/* DYNAMIC VIDEO GRID */}
            <Box 
              sx={{ 
                flexGrow: 1, 
                display: 'grid', 
                // Auto-resizes videos! Ensures no video is smaller than 300px, but stretches to fill the screen.
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '20px', 
                padding: '20px', 
                paddingBottom: '100px', // Leaves room for the control bar
                overflowY: 'auto',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* LOCAL VIDEO (You) */}
              <Box sx={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', position: 'relative', boxShadow: 3 }}>
                <video ref={localVideoRef} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}></video>
                <Typography sx={{ position: 'absolute', bottom: 10, left: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.6)', px: 1.5, py: 0.5, borderRadius: '4px', fontSize: '0.8rem' }}>
                  You
                </Typography>
              </Box>

              {/* REMOTE VIDEOS (Others) */}
              {videos.map((video) =>(
                <Box key={video.socketId} sx={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', position: 'relative', boxShadow: 3 }}>
                  <video
                    data-socket={video.socketId}
                    ref={ref => { if(ref && video.stream) { ref.srcObject = video.stream; } }}
                    autoPlay
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  ></video>
                </Box>
              ))}
            </Box>

            {/* FLOATING CONTROL BAR */}
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: '20px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                display: 'flex', 
                gap: 2, 
                backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                padding: '10px 20px', 
                borderRadius: '50px', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <IconButton onClick={handleVideo} sx={{ color: video ? 'white' : '#ef4444', backgroundColor: video ? 'transparent' : 'rgba(239, 68, 68, 0.2)' }}>
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton> 
              <IconButton onClick={handleAudio} sx={{ color: audio ? 'white' : '#ef4444', backgroundColor: audio ? 'transparent' : 'rgba(239, 68, 68, 0.2)' }}>
                {audio ? <MicIcon /> : <MicOffIcon />}
              </IconButton> 
              {screenAvailable && (
                <IconButton onClick={handleScreen} sx={{ color: screen ? '#3b82f6' : 'white' }}>
                  {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                </IconButton>
              )}
              <Badge badgeContent={newMessages} max={99} color='error'>
                <IconButton onClick={() => setShowModel(!showModel)} sx={{ color: showModel ? '#3b82f6' : 'white' }}>
                  <ChatIcon />
                </IconButton>
              </Badge>
              <IconButton onClick={handleEndCall} sx={{ color: 'white', backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' }, ml: 2 }}>
                <CallEndIcon />
              </IconButton> 
            </Box>
          </Box>

          {/* RIGHT SIDE: CHAT SIDEBAR */}
          {showModel && (
            <Paper 
              elevation={4} 
              sx={{ 
                width: '350px', 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100vh', 
                backgroundColor: '#ffffff',
                borderLeft: '1px solid #e5e7eb',
                zIndex: 10 
              }}
            >
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>Meeting Chat</Typography>
              </Box>

              {/* Chat Messages (SCROLLABLE AREA) */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {messages.length !== 0 ? messages.map((item, index) => {
                  const isMe = item.sender === username; 
                  return(
                    <Box key={index} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                      <Typography variant="caption" sx={{ color: '#6b7280', mb: 0.5, display: 'block', textAlign: isMe ? 'right' : 'left' }}>
                        {isMe ? 'You' : item.sender}
                      </Typography>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 1.5, 
                          backgroundColor: isMe ? '#2563eb' : '#f3f4f6', 
                          color: isMe ? 'white' : '#1f2937', 
                          borderRadius: '16px', 
                          borderTopRightRadius: isMe ? '4px' : '16px', 
                          borderTopLeftRadius: isMe ? '16px' : '4px' 
                        }}
                      >
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{item.data}</Typography>
                      </Paper>
                    </Box>
                  )
                }) : (
                  <Typography sx={{ color: '#9ca3af', textAlign: 'center', mt: 5 }}>No messages yet. Say hi!</Typography>
                )}
              </Box>

              {/* Chat Input */}
              <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb', display: 'flex', gap: 1, backgroundColor: '#f9fafb' }}>
                <TextField 
                  fullWidth 
                  size="small" 
                  placeholder="Type a message..." 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                  }}
                  sx={{ backgroundColor: 'white', borderRadius: 1 }}
                />
                <Button variant="contained" onClick={sendMessage} sx={{ borderRadius: '8px', px: 3 }}>
                  Send
                </Button>
              </Box>
            </Paper>
          )}

        </Box>
      }
    </div>
  )
}