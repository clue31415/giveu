import React, { useEffect, useState } from "react";
import "./App.css";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Timetable() {
  // timetable 배열 상태 관리
  const [timetable, setTimetable] = useState([
    ['1교시','B','G','D','D','F'],
    ['2교시','','','','H','A'],
    ['3교시','C','C','E','','D'],
    ['4교시','H','A','','',''],
    ['5교시','','','C','F','G'],
    ['6교시','','자율','동아리','A','B'],
    ['7교시','E','','','B','']
  ]);
  
  const [newRow, setNewRow] = useState(Array(8).fill('')); // 새로운 행에 추가할 값들

  // 새로운 행 추가 함수
  const addRow = () => {
    setTimetable([...timetable, newRow]);
    setNewRow(Array(8).fill('')); // 새로운 행을 추가한 후, 입력값 초기화
  };

  // 입력값을 상태에 반영하는 함수
  const handleInputChange = (index, event) => {
    const updatedRow = [...newRow];
    updatedRow[index] = event.target.value;
    setNewRow(updatedRow);
  };

  return (
    <div>
      <h1>Timetable</h1>

      {/* timetable 표 */}
      <table style={{ width: '800px', height: '400px', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th></th>
            <th>월</th>
            <th>화</th>
            <th>수</th>
            <th>목</th>
            <th>금</th>
          </tr>
        </thead>
        <tbody>
          {timetable.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex} style={{ width: '100px', height: '50px', border: '1px solid black', textAlign: 'center' }}>{cell}</td>
                //<td key={colIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}