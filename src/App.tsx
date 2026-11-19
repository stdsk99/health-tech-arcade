import { useMemo, useState } from 'react';
import { Activity, ArrowRight, Award, Brain, CheckCircle2, Clock3, Dices, HeartPulse, Lightbulb, Map, RotateCcw, ShieldPlus, Sparkles, Star, Trophy, Wrench, XCircle } from 'lucide-react';

type Zone = 'ER HERO' | 'BODY SCANNER' | 'MEDTECH ENGINEER' | 'INNOVATION LAB';
type TileKind = 'start' | 'knowledge' | 'mission' | 'bonus' | 'event' | 'challenge' | 'final';
type Question = { question: string; options: string[]; answer: number; explain: string; zone: Zone };
type Tile = { id: number; kind: TileKind; zone: Zone };
type Phase = 'home' | 'playing' | 'result';
type Feedback = { title: string; body: string; correct?: boolean; points?: number; answer?: string };

const zones: Zone[] = ['ER HERO', 'BODY SCANNER', 'MEDTECH ENGINEER', 'INNOVATION LAB'];
const zoneIcons = [Activity, Brain, Wrench, Lightbulb];
const zoneColors = ['#ff8b72', '#71baff', '#b79aff', '#65d9b4'];
const questions: Question[] = [
  { zone:'ER HERO', question:'อุปกรณ์ใดใช้วัดความอิ่มตัวของออกซิเจนในเลือด (SpO₂)?', options:['ECG','Pulse Oximeter','เครื่องวัดความดัน','Thermometer'], answer:1, explain:'Pulse Oximeter ใช้แสงสีแดงและอินฟราเรดประเมินค่า SpO₂ และชีพจร' },
  { zone:'ER HERO', question:'หากต้องการบันทึกคลื่นไฟฟ้าหัวใจ ควรเลือกอุปกรณ์ใด?', options:['ECG','Ultrasound','Spirometer','Infusion Pump'], answer:0, explain:'ECG บันทึกกิจกรรมทางไฟฟ้าของหัวใจผ่านขั้วไฟฟ้าที่ติดบนร่างกาย' },
  { zone:'ER HERO', question:'เครื่องมือใดใช้วัดความดันโลหิต?', options:['Defibrillator','Patient Monitor','Blood Pressure Monitor','Pulse Oximeter'], answer:2, explain:'Blood Pressure Monitor ใช้วัดค่าความดันโลหิต เช่น Systolic และ Diastolic' },
  { zone:'BODY SCANNER', question:'เทคโนโลยีใดใช้รังสีเอกซ์สร้างภาพกระดูก?', options:['MRI','Ultrasound','X-ray','ECG'], answer:2, explain:'X-ray ใช้รังสีเอกซ์สร้างภาพ โดยกระดูกดูดกลืนรังสีมากกว่าเนื้อเยื่ออ่อน' },
  { zone:'BODY SCANNER', question:'MRI ใช้หลักการใดในการสร้างภาพ?', options:['สนามแม่เหล็กและคลื่นวิทยุ','รังสีเอกซ์','คลื่นเสียงความถี่ต่ำ','แสงเลเซอร์'], answer:0, explain:'MRI ใช้สนามแม่เหล็กแรงสูงและคลื่นวิทยุ ไม่ใช้รังสีเอกซ์' },
  { zone:'BODY SCANNER', question:'ต้องการดูภาพอวัยวะภายในแบบเรียลไทม์โดยใช้คลื่นเสียง ควรเลือกอะไร?', options:['CT Scan','Ultrasound','X-ray','Mammography'], answer:1, explain:'Ultrasound ใช้คลื่นเสียงความถี่สูงสะท้อนกลับจากเนื้อเยื่อเพื่อสร้างภาพ' },
  { zone:'MEDTECH ENGINEER', question:'ชิ้นส่วนใดทำหน้าที่รับแสงใน Pulse Oximeter?', options:['Photodetector','Buzzer','Relay','Motor'], answer:0, explain:'Photodetector รับแสงที่ผ่านเนื้อเยื่อ แล้วแปลงเป็นสัญญาณไฟฟ้า' },
  { zone:'MEDTECH ENGINEER', question:'ส่วนใดประมวลผลสัญญาณจากเซนเซอร์ในอุปกรณ์?', options:['Battery','Microcontroller','ตัวเรือน','สายรัด'], answer:1, explain:'Microcontroller อ่าน ประมวลผล และควบคุมการทำงานของระบบอิเล็กทรอนิกส์' },
  { zone:'MEDTECH ENGINEER', question:'LED ใน Pulse Oximeter มีหน้าที่หลักอย่างไร?', options:['เก็บข้อมูล','ส่งแสงผ่านเนื้อเยื่อ','แสดงผลตัวเลข','จ่ายไฟให้ระบบ'], answer:1, explain:'LED ส่งแสงสีแดงและอินฟราเรดผ่านปลายนิ้วเพื่อใช้วิเคราะห์การดูดกลืนแสง' },
  { zone:'INNOVATION LAB', question:'เซนเซอร์ใดเหมาะกับการตรวจจับการเคลื่อนไหวและความเร่ง?', options:['MPU6050','DS18B20','Load Cell','pH Sensor'], answer:0, explain:'MPU6050 ประกอบด้วย Accelerometer และ Gyroscope สำหรับวัดความเร่งและการหมุน' },
  { zone:'INNOVATION LAB', question:'ระบบ IoT ทางการแพทย์ควรให้ความสำคัญกับเรื่องใด?', options:['สีของอุปกรณ์เท่านั้น','ความปลอดภัยและความเป็นส่วนตัวของข้อมูล','จำนวน Animation','ความเร็วอินเทอร์เน็ตอย่างเดียว'], answer:1, explain:'ข้อมูลสุขภาพมีความอ่อนไหว ต้องออกแบบการรักษาความลับ ความถูกต้อง และการควบคุมสิทธิ์เข้าถึง' },
  { zone:'INNOVATION LAB', question:'ข้อใดเป็นตัวอย่างการใช้ข้อมูลจากอุปกรณ์สวมใส่?', options:['ติดตามแนวโน้มชีพจร','ยืนยันโรคได้ทุกชนิด','แทนการตรวจแพทย์ทั้งหมด','วัดความดันโดยไม่ใช้เซนเซอร์'], answer:0, explain:'อุปกรณ์สวมใส่ช่วยติดตามแนวโน้มข้อมูลสุขภาพ แต่ไม่ควรใช้แทนการวินิจฉัยทางคลินิก' }
];

const tileKinds: TileKind[] = ['start','knowledge','mission','bonus','knowledge','event','challenge','knowledge','mission','bonus','knowledge','event','challenge','knowledge','mission','bonus','knowledge','event','challenge','knowledge','mission','bonus','challenge','final'];
const tiles: Tile[] = tileKinds.map((kind, id) => ({ id, kind, zone: zones[Math.min(3, Math.floor(Math.max(0,id-1)/6))] }));
const kindLabels: Record<TileKind,string> = { start:'START', knowledge:'KNOWLEDGE', mission:'MISSION', bonus:'BONUS', event:'EVENT', challenge:'CHALLENGE', final:'FINAL' };
const kindSymbols: Record<TileKind,string> = { start:'🚩', knowledge:'💡', mission:'🧩', bonus:'⭐', event:'⚡', challenge:'🔥', final:'🏆' };
const zoneForTile = (id:number) => zones[Math.min(3,Math.floor(Math.max(0,id-1)/6))];
const pickQuestion = (zone:Zone, used:number[]) => {
  const candidates = questions.map((q,i)=>({q,i})).filter(x=>x.q.zone===zone && !used.includes(x.i));
  const pool = candidates.length ? candidates : questions.map((q,i)=>({q,i})).filter(x=>x.q.zone===zone);
  return pool[Math.floor(Math.random()*pool.length)];
};

export default function App() {
  const [phase,setPhase] = useState<Phase>('home');
  const [position,setPosition] = useState(0);
  const [turn,setTurn] = useState(0);
  const [score,setScore] = useState(0);
  const [streak,setStreak] = useState(0);
  const [badges,setBadges] = useState<Zone[]>([]);
  const [used,setUsed] = useState<number[]>([]);
  const [die,setDie] = useState<number|null>(null);
  const [rolling,setRolling] = useState(false);
  const [question,setQuestion] = useState<Question|null>(null);
  const [questionIndex,setQuestionIndex] = useState<number|null>(null);
  const [feedback,setFeedback] = useState<Feedback|null>(null);
  const [moves,setMoves] = useState<number[]>([]);
  const [lastGain,setLastGain] = useState(0);
  const [startedAt,setStartedAt] = useState<number>(0);
  const [sound,setSound] = useState(false);

  const currentZone = zoneForTile(position);
  const elapsed = startedAt ? Math.max(1,Math.round((Date.now()-startedAt)/60000)) : 0;
  const progress = Math.round((position/(tiles.length-1))*100);
  const boardRows = useMemo(()=>Array.from({length:6},(_,row)=>Array.from({length:4},(_,col)=>{
    const index = row%2===0 ? row*4+col : row*4+(3-col);
    return tiles[index];
  })),[]);

  const begin = () => {
    setPosition(0); setTurn(0); setScore(0); setStreak(0); setBadges([]); setUsed([]);
    setDie(null); setQuestion(null); setQuestionIndex(null); setFeedback(null); setMoves([]);
    setLastGain(0); setStartedAt(Date.now()); setPhase('playing');
  };

  const endGame = () => { setQuestion(null); setFeedback(null); setPhase('result'); };

  const resolveTile = (next:number) => {
    const tile = tiles[next];
    setLastGain(0);
    if (tile.kind==='bonus') {
      setScore(s=>s+80); setLastGain(80); setFeedback({title:'BONUS SPACE!',body:'พบ Energy Crystal รับคะแนนพิเศษ +80 คะแนน',points:80});
      return;
    }
    if (tile.kind==='event') {
      const events = [
        {title:'ระบบสำรองพลังงาน!',body:'จัดการพลังงานได้ดี รับคะแนนเพิ่ม +40',points:40},
        {title:'ทีมวิจัยช่วยเหลือ!',body:'ได้รับคำใบ้จากทีมผู้เชี่ยวชาญ รับคะแนนเพิ่ม +30',points:30},
        {title:'เส้นทางลัด!',body:'ค้นพบข้อมูลที่ช่วยให้ภารกิจง่ายขึ้น รับคะแนนเพิ่ม +50',points:50}
      ];
      const event=events[Math.floor(Math.random()*events.length)];
      setScore(s=>s+event.points); setLastGain(event.points); setFeedback(event);
      return;
    }
    const {q,i}=pickQuestion(tile.zone,used);
    setQuestion(q); setQuestionIndex(i);
  };

  const roll = () => {
    if (rolling || question || feedback || phase!=='playing') return;
    setRolling(true);
    window.setTimeout(()=>{
      const value=1+Math.floor(Math.random()*4);
      const next=Math.min(tiles.length-1,position+value);
      setDie(value); setPosition(next); setTurn(t=>t+1); setMoves(m=>[...m,value]); setRolling(false);
      resolveTile(next);
    },550);
  };

  const answer = (choice:number) => {
    if (!question || questionIndex===null) return;
    const correct=choice===question.answer;
    const gained=correct ? 100+(streak>=2?25:0) : 0;
    if(correct){setScore(s=>s+gained);setStreak(s=>s+1);setLastGain(gained);setBadges(old=>old.includes(question.zone)?old:[...old,question.zone]);}
    else {setStreak(0);setLastGain(0);}
    setUsed(old=>[...old,questionIndex]);
    setFeedback({title:correct?'ตอบถูกต้อง!':'ยังไม่ถูกต้อง',body:question.explain,correct,points:gained,answer:question.options[question.answer]});
    setQuestion(null);
  };

  const continueTurn = () => {
    if(position>=tiles.length-1 || turn>=12){endGame();return;}
    setFeedback(null);setDie(null);
  };

  const restart = () => {setPhase('home');setPosition(0);setTurn(0);setScore(0);setStreak(0);setBadges([]);setUsed([]);setDie(null);setQuestion(null);setFeedback(null);setMoves([]);};

  const tileClass = (tile:Tile,active:boolean) => 'board-tile '+tile.kind+(active?' active':'');
  const finalBadge = badges.length===4;

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={restart}><span className="brand-mark"><HeartPulse size={21}/></span><span>HEALTH TECH <b>ADVENTURE</b></span></button>
      <div className="top-actions"><span className="mode-pill">SOLO QUEST</span><button className="sound-btn" onClick={()=>setSound(v=>!v)}>{sound?'เสียงเปิด':'เสียงปิด'}</button></div>
    </header>
    <main>
      {phase==='home' && <section className="intro">
        <div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> DIGITAL BOARD GAME • SOLO MODE</div>
          <h1>ออกผจญภัยในโลก<br/><span>HEALTH TECH</span></h1>
          <p>ทอยลูกเต๋า เดินบนกระดาน ไขภารกิจเครื่องมือแพทย์ และสะสมตราความเชี่ยวชาญ เพื่อก้าวสู่ตำแหน่ง Health Tech Master</p>
          <div className="intro-stats"><div><Clock3/><b>5–8 นาที</b><small>เวลาเล่นโดยประมาณ</small></div><div><Map/><b>24 ช่อง</b><small>เส้นทางผจญภัย</small></div><div><Trophy/><b>4 เขต</b><small>สะสม Zone Badge</small></div></div>
          <button className="primary start-button" onClick={begin}>เริ่มการผจญภัย <ArrowRight size={18}/></button>
          <p className="micro-note">เล่นคนเดียว • ไม่ต้องสมัครสมาชิก • รองรับมือถือ</p>
        </div>
        <div className="intro-board"><div className="mini-board-title">YOUR QUEST MAP <span>24 SPACES</span></div><div className="mini-path">{tiles.map((tile,i)=><span key={tile.id} className={'mini-tile '+tile.kind}>{kindSymbols[tile.kind]}</span>)}</div><div className="map-legend"><span>💡 Knowledge</span><span>🧩 Mission</span><span>⭐ Bonus</span><span>🔥 Challenge</span></div></div>
      </section>}

      {phase==='playing' && <section className="quest-layout">
        <div className="quest-head"><div><div className="eyebrow">YOUR ADVENTURE</div><h1>Health Tech Quest</h1><p>เดินทางผ่าน 4 เขต เพื่อพิชิต Final Mission</p></div><button className="exit-btn" onClick={restart}><RotateCcw size={15}/> ออกจากเกม</button></div>
        <div className="hud">
          <div className="hud-item"><small>คะแนน</small><b>{score.toLocaleString('th-TH')}</b></div>
          <div className="hud-item"><small>เทิร์น</small><b>{turn}/12</b></div>
          <div className="hud-item"><small>ตำแหน่ง</small><b>{position+1}/24</b></div>
          <div className="hud-item"><small>ตราความเชี่ยวชาญ</small><b>{badges.length}/4</b></div>
        </div>
        <div className="quest-columns">
          <div className="board-panel">
            <div className="board-title"><span><Map size={17}/> ADVENTURE MAP</span><span>{progress}% COMPLETE</span></div>
            <div className="board-progress"><i style={{width:progress+'%'}}/></div>
            <div className="board-grid">{boardRows.map((row,r)=><div className="board-row" key={r}>{row.map(tile=><div key={tile.id} className={tileClass(tile,position===tile.id)} style={{'--zone-color':zoneColors[zones.indexOf(tile.zone)]} as React.CSSProperties}>
              <span className="tile-number">{tile.id===0?'START':tile.id===23?'FINISH':String(tile.id).padStart(2,'0')}</span><span className="tile-symbol">{kindSymbols[tile.kind]}</span>{position===tile.id&&<span className="player-token">🧑‍🚀</span>}
            </div>)}</div>)}</div>
            <div className="zone-legend">{zones.map((z,i)=>{const ZIcon=zoneIcons[i];return <span key={z}><i style={{background:zoneColors[i]}}/><ZIcon size={13}/>{z}</span>;})}</div>
          </div>
          <aside className="side-panel">
            <div className="zone-card"><div className="eyebrow">CURRENT ZONE</div><h3>{currentZone}</h3><p>{['เลือกใช้อุปกรณ์ให้เหมาะกับสถานการณ์','สำรวจเทคโนโลยีภาพวินิจฉัย','เรียนรู้ส่วนประกอบและระบบอิเล็กทรอนิกส์','ประยุกต์ความรู้สู่การสร้างนวัตกรรม'][zones.indexOf(currentZone)]}</p></div>
            <div className="dice-card"><div className="dice-face">{rolling?'🎲':die?['⚀','⚁','⚂','⚃'][die-1]:'🎲'}</div><p>{rolling?'กำลังทอยลูกเต๋า...':die?'ทอยได้ '+die+' ช่อง':'พร้อมออกเดินทาง?'}</p><button className="primary roll-button" onClick={roll} disabled={rolling||!!question||!!feedback}>{rolling?'กำลังทอย...':'ทอยลูกเต๋า'} <Dices size={18}/></button></div>
            <div className="badge-card"><div className="eyebrow">ZONE BADGES</div><div className="badge-list">{zones.map((z,i)=>{const ZIcon=zoneIcons[i];return <span key={z} className={badges.includes(z)?'earned':''}><ZIcon size={16}/><small>{z}</small>{badges.includes(z)&&<CheckCircle2 size={13}/>}</span>;})}</div></div>
          </aside>
        </div>
        {question && <div className="modal-backdrop"><div className="mission-modal"><div className="modal-top"><span className="eyebrow"><Sparkles size={13}/> {question.zone} • MISSION</span><span className="challenge-label">{tiles[position].kind.toUpperCase()}</span></div><h2>{question.question}</h2><div className="option-list">{question.options.map((opt,i)=><button key={opt} className="option-button" onClick={()=>answer(i)}><b>{String.fromCharCode(65+i)}</b>{opt}<ArrowRight size={15}/></button>)}</div><p className="modal-note">ตอบถูก รับ 100 คะแนน • ตอบผิดจะได้รับคำอธิบายเพื่อเรียนรู้</p></div></div>}
        {feedback && <div className="modal-backdrop"><div className="feedback-modal"><div className={'feedback-icon '+(feedback.correct===false?'incorrect':'')}>{feedback.correct===false?<XCircle size={30}/>:feedback.points?<Star size={30}/>:<CheckCircle2 size={30}/>}</div><div className="eyebrow">QUEST UPDATE</div><h2>{feedback.title}</h2><p>{feedback.body}</p>{feedback.answer&&<p className="correct-answer">คำตอบที่ถูกต้อง: <b>{feedback.answer}</b></p>}{feedback.points!==undefined&&<div className="points-earned">+{feedback.points} คะแนน</div>}<button className="primary" onClick={continueTurn}>{position>=23||turn>=12?'สรุปผลการผจญภัย':'เดินทางต่อ'} <ArrowRight size={17}/></button></div></div>}
        <p className="disclaimer">ภารกิจเป็นสถานการณ์จำลองเพื่อการเรียนรู้ ไม่ใช่คำแนะนำในการวินิจฉัยหรือรักษาผู้ป่วย</p>
      </section>}

      {phase==='result' && <section className="result-screen">
        <div className="result-trophy">🏆</div><div className="eyebrow">ADVENTURE COMPLETED</div><h1>{position>=23?'ภารกิจสำเร็จ!':'จบการเดินทาง!'}</h1><p className="result-subtitle">{position>=23?'คุณเดินทางถึง Innovation Core แล้ว':'คุณทำภารกิจได้ดี ลองเล่นอีกครั้งเพื่อไปให้ถึงเส้นชัย'}</p>
        <div className="result-score"><small>คะแนนรวม</small><strong>{score.toLocaleString('th-TH')}</strong><span>POINTS</span></div>
        <div className="result-grid"><div><b>{turn}</b><small>เทิร์นที่ใช้</small></div><div><b>{position+1}/24</b><small>ช่องที่เดินทางถึง</small></div><div><b>{badges.length}/4</b><small>Zone Badges</small></div></div>
        <div className="earned-badges">{zones.map((z,i)=>{const ZIcon=zoneIcons[i];return <span key={z} className={badges.includes(z)?'earned':'locked'}><ZIcon size={17}/>{z}</span>;})}</div>
        <div className="result-actions"><button className="primary" onClick={begin}><RotateCcw size={17}/> เล่นอีกครั้ง</button><button className="secondary" onClick={restart}>กลับหน้าแรก</button></div>
        <p className="disclaimer">คะแนนนี้เป็นคะแนนในอุปกรณ์และรอบการเล่นนี้ ยังไม่ถูกส่งขึ้น Leaderboard ออนไลน์</p>
      </section>}
    </main>
    <footer><span>HEALTH TECH ADVENTURE</span><span>PLAY • LEARN • EXPLORE</span><span>EDUCATIONAL GAME</span></footer>
  </div>;
}
