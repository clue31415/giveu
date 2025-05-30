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
  const [grade, setGrade] = useState(1);
  const [classroom, setClassroom] = useState(1);

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

    const handleGradeChange = (delta) => {
    setGrade(prev => {
      const newGrade = prev + delta;
      return newGrade < 1 ? 1 : newGrade > 3 ? 3 : newGrade;
    });
  };

  const handleClassChange = (delta) => {
    setClassroom(prev => {
      const newClass = prev + delta;
      return newClass < 1 ? 1 : newClass > 15 ? 15 : newClass;
    });
  };

  return (
    <div>
      <h1>시간표</h1>

      {/* 학년/반 선택 UI */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div>
          <button onClick={() => handleGradeChange(-1)}>{'<'}</button>
          <span style={{ margin: '0 10px' }}>{grade}</span>
          <button onClick={() => handleGradeChange(1)}>{'>'}</button>
          <span> 학년</span>
        </div>
        <div>
          <button onClick={() => handleClassChange(-1)}>{'<'}</button>
          <span style={{ margin: '0 10px' }}>{classroom}</span>
          <button onClick={() => handleClassChange(1)}>{'>'}</button>
          <span> 반</span>
        </div>
      </div>

      {/* timetable 표 */}
      <table style={{ width: '100%', height: '400px', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
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
                <td key={colIndex} style={{ height: '50px', border: '1px solid black', textAlign: 'center' }}>{cell}</td>
                //<td key={colIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
