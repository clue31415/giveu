import React, { useEffect, useState } from "react";
import "./App.css";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Write() {
    const [title, changetitle] = useState();
    const [content, changecontent] = useState();
    const [name, changename] = useState();
    const [pw, changepw] = useState();
    const userData = [title, content, name, pw];
    const navigate = useNavigate();
    function uploadpost() {
        fetch("http://172.30.1.110:8080/api/users/upload", { //auth 주소에서 받을 예정
          method: "POST", // method :통신방법
          headers: {      // headers: API 응답에 대한 정보를 담음
            "content-type": "application/json",
          },
          body: JSON.stringify(userData), //userData라는 객체를 보냄
        })
          .then((res) => res.json())
          .then((json) => {
          });
        window.location.replace('/');
        //navigate('/');
            }
    return (
        <div className="App">
        <div className="op-title">
        <div><Link className={"link-style1"} to={"/"}>거제옥포고등학교</Link></div>
        </div>
        <div className="op-write">
            <h1>글 쓰기</h1>
            
            <p>제목</p>
            <input type="text" spellcheck="false" value={title} onChange={(e) =>{
                changetitle(e.target.value);
            }} />
            <p>글</p>
            <div className="write-content">
            <input type="text" spellcheck="false" value={content} onChange={(e) =>{
                changecontent(e.target.value);
            }} />
            </div>
            <p>학번</p>
            <div className="write-namepw">
            <input type="text" spellcheck="false" value={name} onChange={(e) =>{
                changename(e.target.value);
            }} />
            </div>
            <p>비밀번호</p>
            <div className="write-namepw">
            <input type="text" spellcheck="false" value={pw} onChange={(e) =>{
                changepw(e.target.value);
            }} />
            </div>
            <br></br>
            <button className="button-design1" onClick={uploadpost}>완료</button>
            <div className="blank">
                <br></br>
            </div>
        </div>
        </div>
    );
}
