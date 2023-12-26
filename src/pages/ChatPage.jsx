import {useEffect, useState} from "react";
import { useRecoilValue } from "recoil";
import { useParams } from "react-router-dom";

import Navbar from "@components/common/Navbar.jsx";
import ReportBtn from "@assets/img_btn_report.png";
import TicketImg from "@assets/img_ticket.png";

import InputField from "@components/InputField.jsx";
import socket from "../server.js"

import { userInfoState } from "@recoil/userInfoState";
// import fetchChatRoom from "@utils/fetchChatRoom.jsx";

export default function ChatPage({chatRoomId}) {

  const userInfo = useRecoilValue(userInfoState); 
  const userId = userInfo.id;

  const [user, setUser] = useState(null); // 상대방 정보
  const [message, setMessage] = useState(""); // 단일 메시지
  const [messageList, setMessageList] = useState([]); //해당 채팅방에 있는 모든 메시지

  const sendMessage = (event) => {
    event.preventDefault();
    //{"memberId":"","message":""} memberId를 추가해야함
    socket.emit("sendMessage", message, (res) => {
      console.log("sendMessage response값", res);
    });
  }


  console.log('모든 메시지 내용', messageList);

  useEffect(() => {
    socket.on('message', (message) => { // message라는 이름으로 들어온 게 있으면, 듣겠다!
        setMessageList((prevState) => prevState.concat(message));
        console.log("res", message);
    });
  }, []);
  


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
              PIN번호: C98998898
            </div>
          </div>
          <div className="w-1/6 mt-4 bg-navy-basic border rounded-lg">
            {/* 채팅 상대방 정보 */}
            <p className="text-white font-extrabold text-xl">헬로키티</p>
          </div>

          <div className="relative overflow-y-auto h-96 border-navy-basic border-4 rounded-lg max-w-5xl">
            <div>
              {/* 채팅 내용 */}
              {messageList.map((msg, index) => (
                <div
                  key={index}
                  className={`chat ${
                    // msg.from === messageList.participants[0].id
                    userId === msg.user.id
                      ? "chat-end"
                      : "chat-start"
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
              <InputField />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
