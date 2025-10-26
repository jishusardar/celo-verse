'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameContext } from '../../context/GameContext';

const VideoChat = ({ isOpen, onClose }) => {
  const { socket, players } = useGameContext();
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [peerStreams, setPeerStreams] = useState(new Map());

  const localVideoRef = useRef(null);
  const peerConnectionsRef = useRef(new Map());
  const localStreamRef = useRef(null);

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Get user media (camera and mic)
  const getUserMedia = useCallback(async (video = true, audio = true) => {
    try {
      console.log('🎥 Requesting media access:', { video, audio });

      // Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported');
      }

      const constraints = {
        video: video ? {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user'
        } : false,
        audio: audio
      };

      console.log('🎥 Using constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('🎥 Got media stream with tracks:', stream.getTracks().map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState,
        label: t.label
      })));

      localStreamRef.current = stream;

      // Set video source immediately
      // Wait a bit for the video element to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      if (localVideoRef.current) {
        console.log('🎥 Setting video element srcObject');
        localVideoRef.current.srcObject = stream;

        // Force play (sometimes needed)
        try {
          await localVideoRef.current.play();
          console.log('🎥 Video element started playing');
        } catch (playError) {
          console.warn('🎥 Could not auto-play video:', playError);
          // Try again after a delay
          setTimeout(() => {
            if (localVideoRef.current) {
              localVideoRef.current.play().catch(e => console.warn('🎥 Delayed play failed:', e));
            }
          }, 1000);
        }
      } else {
        console.warn('🎥 Local video ref not available');
      }

      return stream;
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      alert(`Could not access ${video && audio ? 'camera and microphone' : video ? 'camera' : 'microphone'}.\nError: ${error.message}\nPlease check permissions and try again.`);
      return null;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((peerId) => {
    console.log('Creating peer connection for:', peerId);
    const pc = new RTCPeerConnection(configuration);

    // Add local stream tracks to peer connection
    if (localStreamRef.current) {
      console.log('Adding local tracks to peer connection:', localStreamRef.current.getTracks().length);
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle renegotiation needed (when tracks are added later)
    pc.onnegotiationneeded = async () => {
      console.log('Negotiation needed for peer:', peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { targetId: peerId, offer });
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote stream from:', peerId, event.streams[0]);
      setPeerStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.set(peerId, event.streams[0]);
        return newStreams;
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          targetId: peerId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${peerId}:`, pc.connectionState);
    };

    peerConnectionsRef.current.set(peerId, pc);
    return pc;
  }, [socket]);

  // Handle incoming offer
  useEffect(() => {
    if (!socket) return;

    const handleOffer = async ({ fromId, offer }) => {
      console.log('📨 Received offer from:', fromId);
      try {
        const pc = createPeerConnection(fromId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log('📨 Set remote description from offer');

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log('📨 Created and set local answer');

        socket.emit('answer', { targetId: fromId, answer });
        console.log('📨 Sent answer to:', fromId);
      } catch (error) {
        console.error('❌ Error handling offer:', error);
      }
    };

    const handleAnswer = async ({ fromId, answer }) => {
      const pc = peerConnectionsRef.current.get(fromId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIceCandidate = ({ fromId, candidate }) => {
      const pc = peerConnectionsRef.current.get(fromId);
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    socket.on('offer', handleOffer);
    const handlePeerLeft = (peerId) => {
      console.log('🚪 Peer left video chat:', peerId);

      // Close the peer connection
      const pc = peerConnectionsRef.current.get(peerId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(peerId);
      }

      // Remove peer stream
      setPeerStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.delete(peerId);
        return newStreams;
      });
    };

    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('peerLeft', handlePeerLeft);

    return () => {
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('peerLeft', handlePeerLeft);
    };
  }, [socket, createPeerConnection]);

  // Initialize video chat
  const startVideoChat = async () => {
    if (!socket) return;

    console.log('Starting video chat...');
    const stream = await getUserMedia(true, true); // Start with both video and audio
    if (!stream) {
      console.log('Failed to get media stream');
      return;
    }

    // Wait for component to re-render with video element
    setIsConnected(true);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);

    // Delay joining room to ensure video element is ready
    setTimeout(() => {
      console.log('Media stream obtained, joining video room');
      socket.emit('joinVideoRoom');
    }, 500);
  };

  // Stop video chat
  const stopVideoChat = () => {
    console.log('🛑 Stopping video chat');

    // Notify peers before closing connections
    if (socket) {
      socket.emit('leaveVideoRoom');
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc, peerId) => {
      console.log('🛑 Closing peer connection:', peerId);
      pc.close();
    });
    peerConnectionsRef.current.clear();

    // Stop local stream
    if (localStreamRef.current) {
      console.log('🛑 Stopping local stream tracks');
      localStreamRef.current.getTracks().forEach(track => {
        console.log('🛑 Stopping track:', track.kind);
        track.stop();
      });
      localStreamRef.current = null;
    }

    // Clear video element
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setPeerStreams(new Map());
    setIsConnected(false);
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
  };

  // Toggle video
  const toggleVideo = async () => {
    if (!localStreamRef.current) {
      // Start video if no stream exists
      const stream = await getUserMedia(true, isAudioEnabled);
      if (stream) {
        setIsVideoEnabled(true);
        socket?.emit('toggleVideo', { enabled: true });
      }
      return;
    }

    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
      socket?.emit('toggleVideo', { enabled: videoTrack.enabled });
    } else {
      // Try to add video track if it doesn't exist
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = videoStream.getVideoTracks()[0];
        localStreamRef.current.addTrack(videoTrack);

        // Update all peer connections with new track
        peerConnectionsRef.current.forEach(pc => {
          pc.addTrack(videoTrack, localStreamRef.current);
        });

        setIsVideoEnabled(true);
        socket?.emit('toggleVideo', { enabled: true });
      } catch (error) {
        console.error('Error enabling video:', error);
        alert('Could not enable video. Please check camera permissions.');
      }
    }
  };

  // Toggle audio
  const toggleAudio = async () => {
    if (!localStreamRef.current) {
      // Start audio if no stream exists
      const stream = await getUserMedia(isVideoEnabled, true);
      if (stream) {
        setIsAudioEnabled(true);
        socket?.emit('toggleAudio', { enabled: true });
      }
      return;
    }

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
      socket?.emit('toggleAudio', { enabled: audioTrack.enabled });
    } else {
      // Try to add audio track if it doesn't exist
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTrack = audioStream.getAudioTracks()[0];
        localStreamRef.current.addTrack(audioTrack);

        // Update all peer connections with new track
        peerConnectionsRef.current.forEach(pc => {
          pc.addTrack(audioTrack, localStreamRef.current);
        });

        setIsAudioEnabled(true);
        socket?.emit('toggleAudio', { enabled: true });
      } catch (error) {
        console.error('Error enabling audio:', error);
        alert('Could not enable microphone. Please check microphone permissions.');
      }
    }
  };

  // Connect to a peer
  const connectToPeer = async (peerId) => {
    const pc = createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('offer', { targetId: peerId, offer });
  };

  // Auto-connect to existing peers when joining
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleVideoRoomJoined = (peerIds) => {
      peerIds.forEach(peerId => {
        if (peerId !== socket.id) {
          connectToPeer(peerId);
        }
      });
    };

    socket.on('videoRoomJoined', handleVideoRoomJoined);

    return () => socket.off('videoRoomJoined', handleVideoRoomJoined);
  }, [socket, isConnected, connectToPeer]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">Video Chat</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-500 text-2xl"
          >
            ×
          </button>
        </div>

        {!isConnected ? (
          <div className="text-center py-8">
            <button
              onClick={startVideoChat}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Start Video Chat
            </button>
          </div>
        ) : (
          <>
            {/* Local video */}
            <div className="mb-4">
              <h3 className="text-white mb-2">Your Video {isVideoEnabled ? '(On)' : '(Off)'}</h3>
              <div className="relative">
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75 rounded">
                    <span className="text-white text-lg">📷</span>
                  </div>
                )}
              </div>
              {localStreamRef.current && (
                <div className="text-xs text-white mt-1">
                  Tracks: {localStreamRef.current.getTracks().map(t => t.kind).join(', ')}
                </div>
              )}
            </div>

            {/* Peer videos */}
            <div className="mb-4">
              <h3 className="text-white mb-2">Other Players ({peerStreams.size})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from(peerStreams).map(([peerId, stream]) => (
                  <div key={peerId} className="text-center">
                    <video
                      autoPlay
                      playsInline
                      className="w-48 h-36 bg-gray-700 rounded border-2 border-green-500"
                      ref={(video) => {
                        if (video && video.srcObject !== stream) {
                          console.log('Setting peer video for:', peerId);
                          video.srcObject = stream;
                        }
                      }}
                      onLoadedData={() => console.log('Peer video loaded for:', peerId)}
                      onError={(e) => console.error('Peer video error for:', peerId, e)}
                    />
                    <p className="text-white text-sm mt-1">
                      {players.get(peerId)?.name || 'Player'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleVideo}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  isVideoEnabled
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {isVideoEnabled ? '📹 Video On' : '📷 Video Off'}
              </button>

              <button
                onClick={toggleAudio}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  isAudioEnabled
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {isAudioEnabled ? '🎤 Mic On' : '🔇 Mic Off'}
              </button>

              <button
                onClick={stopVideoChat}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                End Call
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoChat;