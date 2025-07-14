import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { Link } from "react-router-dom";
import io from 'socket.io-client';
const socket = io('https://okpogo.servehttp.com');

export default function Team() {
  const [roomId, setRoomId] = useState('room123');
  const [inCall, setInCall] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);

  // Socket 이벤트 핸들러 등록 (컴포넌트 마운트 시 한 번만)
  useEffect(() => {
    const handleCreated = () => {
      console.log('🟢 You created the room. You are the caller.');
      createPeerConnection(true);
    };

    const handleJoined = () => {
      console.log('🟡 You joined the room. You are the callee.');
    };

    const handleReady = async () => {
      console.log('🟢 Both participants joined. You can receive an offer.');
      //createPeerConnection(false);
      try {
        if (!localStreamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localStreamRef.current = stream;
    
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
    
        createPeerConnection(false); // ✅ 스트림 확보 후 호출
      } catch (err) {
        console.error('🔴 getUserMedia error on ready:', err);
        alert('칼리의 카메라/마이크 권한을 확인해주세요.');
      }
    };

    const handleOffer = async ({ sdp, type }) => {
      console.log('offer received');
      if (!peerRef.current) return;
      await peerRef.current.setRemoteDescription(new RTCSessionDescription({ sdp, type }));
      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);
      socket.emit('answer', { roomId, sdp: answer.sdp, type: answer.type });
      console.log('✅ Answer sent.');
    };

    const handleAnswer = async ({ sdp, type }) => {
      if (!peerRef.current) return;
      await peerRef.current.setRemoteDescription(new RTCSessionDescription({ sdp, type }));
      console.log('✅ Answer received and set.');
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (peerRef.current && candidate) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('❄️ ICE candidate added');
        } catch (err) {
          console.error('❄️ ICE candidate error:', err);
        }
      }
    };

    const handleFull = () => {
      alert('🚫 Room is full. Cannot join.');
      setInCall(false);
    };

    socket.on('created', handleCreated);
    socket.on('joined', handleJoined);
    socket.on('ready', handleReady);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('full', handleFull);

    // 컴포넌트 언마운트 시 이벤트 핸들러 정리
    return () => {
      socket.off('created', handleCreated);
      socket.off('joined', handleJoined);
      socket.off('ready', handleReady);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('full', handleFull);
      // socket.disconnect(); // 필요 시 컴포넌트 완전 종료 시 호출
    };
  }, [roomId]);

  // inCall이 true가 된 후 비디오 엘리먼트에 스트림 연결
  useEffect(() => {
    if (inCall && localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [inCall]);

  // 방에 입장해서 미디어 스트림 가져오기
  const joinRoom = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      socket.emit('join', roomId);
      setInCall(true);
    } catch (err) {
      console.error('🔴 getUserMedia error:', err);
      alert('카메라 또는 마이크 권한을 허용해주세요.');
    }
  };

const createPeerConnection = async (isCaller) => {
  console.log('📞 createPeerConnection 호출됨. Caller?', isCaller);

  if (!localStreamRef.current) {
    console.warn('🚫 localStream 준비 안됨');
  } else {
    console.log('🎬 localStream 준비됨, 트랙 수:', localStreamRef.current.getTracks().length);
  }

  const peer = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
  });

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('📤 ICE candidate 생성됨:', event.candidate);
      socket.emit('ice-candidate', { roomId, candidate: event.candidate });
    } else {
      console.log('⚠️ ICE candidate 전송 완료 또는 끝');
    }
  };

  peer.oniceconnectionstatechange = () => {
    console.log('🔄 ICE 상태:', peer.iceConnectionState);
  };

  peer.ontrack = (event) => {
    console.log('📺 ontrack', event.streams[0]);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = event.streams[0];
    }
  };

  localStreamRef.current.getTracks().forEach((track) => {
    console.log('➕ 트랙 추가:', track.kind);
    peer.addTrack(track, localStreamRef.current);
  });

  peerRef.current = peer;

  if (isCaller) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    console.log('📡 Offer 생성됨');
    socket.emit('offer', { roomId, sdp: offer.sdp, type: offer.type });
  } else {
    console.log('callee 들어옴');
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('offer', { roomId, sdp: offer.sdp, type: offer.type });
    console.log('callee offer 요청');
  }
};
/*
  const createPeerConnection = async (isCaller) => {
    if (!localStreamRef.current) {
      console.warn('Local stream is not ready yet.');
      return;
    }

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { roomId, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // 로컬 미디어 스트림 트랙 추가
    localStreamRef.current.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current);
    });

    peerRef.current = peer;

    if (isCaller) {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit('offer', { roomId, sdp: offer.sdp, type: offer.type });
      console.log('📤 Offer sent.');
    }
  };
*/

  // (선택) 통화 종료 함수
  const leaveCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setInCall(false);
    socket.emit('leave', roomId); // 백엔드에서 구현 필요 (옵션)
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>🎥 WebRTC 영상 통화</h2>

      {!inCall && (
        <div>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Room ID"
            style={{ padding: '8px', fontSize: '16px' }}
          />
          <button onClick={joinRoom} style={{ marginLeft: '10px', padding: '8px 16px', fontSize: '16px' }}>
            방 입장
          </button>
        </div>
      )}

      {inCall && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: '300px', marginRight: '20px', backgroundColor: '#000' }}
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '300px', backgroundColor: '#000' }}
          />
        </div>
      )}

      {inCall && (
        <button
          onClick={leaveCall}
          style={{ marginTop: '20px', padding: '8px 16px', fontSize: '16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          통화 종료
        </button>
      )}
    </div>
  );
}
