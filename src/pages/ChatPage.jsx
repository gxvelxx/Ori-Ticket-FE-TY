import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

import {useEffect, useState} from "react";
import axios from 'axios';
import { useRecoilValue } from "recoil";
import { useParams } from "react-router-dom";

import InputField from "@components/InputField.jsx";
import Navbar from "@components/common/Navbar.jsx";
import ReportBtn from "@assets/img_btn_report.png";

import { userInfoState } from "@recoil/userInfoState";

export default function ChatPage() {
  const { chatRoomId } = useParams();

  const userInfo = useRecoilValue(userInfoState);
  const userId = userInfo.id;

  const [isFetched, setIsFetched] = useState(false); // fetchChatRoom이 완료되었는지 확인

  // const [transactionId, setTransactionId] = useState();

  const [message, setMessage] = useState(""); // 메시지 입력창(InputField)에서 보낼 메시지
  const [messageList, setMessageList] = useState([]); //해당 채팅방에 있는 모든 메시지

  const [client, setClient] = useState(null);

  useEffect(() => {
    // if (!isFetched){
    //   return;
    // }
    console.log("useEffect called");

    try{
      // SockJS클라이언트를 생성하여 서버의 웹소켓 세팅
      const socket = new SockJS(`https://oriticket.link/ws-stomp`);
      const stompClient = Stomp.over(socket);
      console.log("웹소켓 세팅완료");
      console.log(socket);
      console.log(stompClient);

      // Stomp를 이용해 웹소켓 서버에 연결
      if (socket.readyState === WebSocket.OPEN) {
        console.log("웹소켓 연결됨 (socket.readyState === WebSocket.OPEN)");
        

      } else {
        console.log("웹소켓 연결시도중");
      }

      // 웹소켓 연결
      socket.onopen = () => {
        console.log("웹소켓 열려있다!");
      };


      stompClient.connect(
        {},
        () => {
          try {
          console.log("Connected to server");

          stompClient.subscribe(`/send/${chatRoomId}`, (message) => {
              setMessageList((prevState) => [
                ...prevState,
                JSON.parse(message.body),
              ]);
            });

            setClient(stompClient);
          } catch (error) {
            console.error("Error in success callback:", error);
          }
        },
        (error) => {
          console.log("Failed to connect:", error);
        }
      );
  

      // 웹소켓 연결 종료
      socket.onclose = () => {
        console.log("웹소켓 연결 종료");
      };

      // 웹소켓에서 메시지 받기
      socket.onmessage = (e) => {
        console.log("메시지 수신:", e.data);
      };
    } catch (error) {
      console.error("SockJS 인스턴스 생성 중 에러 발생:", error);
    }

    // 컴포넌트 unmount 시에 웹소켓 연결 종료 (채팅 페이지를 벗어날 때)
    // return () => {
    //   if(stompClient) {stompClient.disconnect();}
    // };
  }, [isFetched]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (message && client) {
      const msg = { memberId: userId, message: message };
      client.send(``, {}, JSON.stringify(msg));
      setMessage("");
    }
  };

  // 채팅방 상단에, 거래번호 띄워주기
  // const fetchChatRoom = async () => {
  //   const response = await axios.get(
  //     `https://oriticket.link/chatroom?&id=${chatRoomId}`,
  //     {
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );

  //   if (response && response.status === 200) {
  //     setTransactionId(response.data.transactionId);
  //     console.log("이 채팅방의 거래번호", response.data.transactionId);
  //     setIsFetched(true); 
  //   }
  // };

  // useEffect(() => {
  //   fetchChatRoom();
  // }, []);

  return (
    <div className="h-screen">
      <Navbar />

      <div className="flex justify-center">
        <div className="flex-col justify-center w-4/5">
          <div className="flex justify-end">
            <button className="w-1/6 p-0">
              <img src={ReportBtn} />
            </button>
          </div>

          <div className="border rounded-md border-navy-basic">
            <div className=" text-navy-basic font-extrabold text-4xl">
              거래중인 티켓정보
            </div>
            <div className="text-black font-extrabold text-3xl">
              {/* 거래번호: {transactionId} */}
            </div>
          </div>
          <div className="w-1/6 mt-4 bg-navy-basic border rounded-lg">
            {/* 채팅 상대방 정보 */}
            <p className="text-white font-extrabold text-xl">채팅</p>
          </div>

          <div className="relative overflow-y-auto h-96 border-navy-basic border-4 rounded-lg max-w-5xl">
            <div>
              {/* 채팅 내용 */}
              {messageList.map((msg, index) => (
                <div
                  key={index}
                  className={`chat ${
                    userId === msg.memberId ? "chat-end" : "chat-start"
                  }`}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img
                        alt="Tailwind CSS chat bubble component"
                        src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                      />
                    </div>
                  </div>
                  <div className="chat-header">
                    {msg.sender_name}
                    <time className="text-xs opacity-50">12:46</time>
                  </div>
                  <div className="text-left max-w-sm chat-bubble chat-bubble-warning">
                    {msg.text}
                  </div>

                  {/* {msg.type === "text" ? (
                    <p>{msg.text}</p>
                  ) : (
                    <img
                      src={msg.attachment.payload.url}
                      alt={msg.attachment.caption}
                    />
                  )} */}
                </div>
              ))}
              <InputField
                message={message}
                setMessage={setMessage}
                sendMessage={sendMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

