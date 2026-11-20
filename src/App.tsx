import { useMemo, useRef, useState } from 'react';
import { Activity, ArrowRight, Brain, CheckCircle2, Clock3, Dices, HeartPulse, Lightbulb, Map, RotateCcw, Sparkles, Star, Trophy, Wrench, XCircle } from 'lucide-react';

type Zone = 'ER HERO' | 'BODY SCANNER' | 'MEDTECH ENGINEER' | 'INNOVATION LAB';
type TileKind = 'start' | 'knowledge' | 'mission' | 'bonus' | 'event' | 'challenge' | 'final';
type Question = { question: string; options: string[]; answer: number; explain: string; zone: Zone };
type Tile = { id: number; kind: TileKind; zone: Zone };
type Phase = 'home' | 'playing' | 'result';
type Feedback = { title: string; body: string; correct?: boolean; points?: number; answer?: string };

const zones: Zone[] = ['ER HERO', 'BODY SCANNER', 'MEDTECH ENGINEER', 'INNOVATION LAB'];
const zoneIcons = [Activity, Brain, Wrench, Lightbulb];
const zoneColors = ['#ff8b72', '#71baff', '#b79aff', '#65d9b4'];
// Question bank: 6 questions per zone. Each play draws without repeating a question.
const questions: Question[] = [
  { zone:'ER HERO', question:'อุปกรณ์ใดใช้วัดความอิ่มตัวของออกซิเจนในเลือด (SpO₂)?', options:['ECG','Pulse Oximeter','เครื่องวัดความดัน','Thermometer'], answer:1, explain:'Pulse Oximeter ใช้แสงสีแดงและอินฟราเรดประเมินค่า SpO₂ และชีพจร' },
  { zone:'ER HERO', question:'หากต้องการบันทึกคลื่นไฟฟ้าหัวใจ ควรเลือกอุปกรณ์ใด?', options:['ECG','Ultrasound','Spirometer','Infusion Pump'], answer:0, explain:'ECG บันทึกกิจกรรมทางไฟฟ้าของหัวใจผ่านขั้วไฟฟ้าที่ติดบนร่างกาย' },
  { zone:'ER HERO', question:'เครื่องมือใดใช้วัดความดันโลหิต?', options:['Defibrillator','Patient Monitor','Blood Pressure Monitor','Pulse Oximeter'], answer:2, explain:'Blood Pressure Monitor ใช้วัดค่าความดันโลหิต เช่น Systolic และ Diastolic' },
  { zone:'ER HERO', question:'เครื่อง Defibrillator มีหน้าที่หลักอย่างไร?', options:['กระตุ้นหัวใจด้วยพลังงานไฟฟ้าในภาวะหัวใจเต้นผิดจังหวะบางชนิด','วัดอุณหภูมิ','วัดระดับน้ำตาล','ช่วยฟังเสียงปอด'], answer:0, explain:'Defibrillator ส่งพลังงานไฟฟ้าตามข้อบ่งชี้เพื่อรักษาภาวะหัวใจเต้นผิดจังหวะที่สามารถช็อกได้' },
  { zone:'ER HERO', question:'อุปกรณ์ใดใช้ติดตามคลื่นไฟฟ้าหัวใจ ชีพจร และค่าทางสรีรวิทยาหลายชนิด?', options:['Patient Monitor','Otoscope','Nebulizer','Suction Regulator'], answer:0, explain:'Patient Monitor ใช้ติดตามพารามิเตอร์ทางสรีรวิทยาหลายรายการอย่างต่อเนื่อง' },
  { zone:'ER HERO', question:'เครื่อง Infusion Pump ใช้ทำหน้าที่ใด?', options:['ควบคุมการให้สารน้ำหรือยาในอัตราที่กำหนด','สร้างภาพกระดูก','วัดการได้ยิน','ตรวจคลื่นสมอง'], answer:0, explain:'Infusion Pump ควบคุมอัตราและปริมาตรการให้สารน้ำหรือยาตามการตั้งค่า' },

  { zone:'BODY SCANNER', question:'เทคโนโลยีใดใช้รังสีเอกซ์สร้างภาพกระดูก?', options:['MRI','Ultrasound','X-ray','ECG'], answer:2, explain:'X-ray ใช้รังสีเอกซ์สร้างภาพ โดยกระดูกดูดกลืนรังสีมากกว่าเนื้อเยื่ออ่อน' },
  { zone:'BODY SCANNER', question:'MRI ใช้หลักการใดในการสร้างภาพ?', options:['สนามแม่เหล็กและคลื่นวิทยุ','รังสีเอกซ์','คลื่นเสียงความถี่ต่ำ','แสงเลเซอร์'], answer:0, explain:'MRI ใช้สนามแม่เหล็กแรงสูงและคลื่นวิทยุ ไม่ใช้รังสีเอกซ์' },
  { zone:'BODY SCANNER', question:'ต้องการดูภาพอวัยวะภายในแบบเรียลไทม์โดยใช้คลื่นเสียง ควรเลือกอะไร?', options:['CT Scan','Ultrasound','X-ray','Mammography'], answer:1, explain:'Ultrasound ใช้คลื่นเสียงความถี่สูงสะท้อนกลับจากเนื้อเยื่อเพื่อสร้างภาพ' },
  { zone:'BODY SCANNER', question:'CT Scan สร้างภาพด้วยหลักการใด?', options:['การหมุนของชุดเอกซเรย์และตัวตรวจจับรอบร่างกาย','สนามแม่เหล็กอย่างเดียว','คลื่นเสียงสะท้อน','แสงอินฟราเรด'], answer:0, explain:'CT ใช้รังสีเอกซ์จากหลายมุมและการประมวลผลคอมพิวเตอร์สร้างภาพตัดขวาง' },
  { zone:'BODY SCANNER', question:'การตรวจ Mammography ออกแบบมาเพื่อถ่ายภาพอวัยวะใดเป็นหลัก?', options:['สมอง','เต้านม','ปอด','ไต'], answer:1, explain:'Mammography เป็นการถ่ายภาพเต้านมด้วยรังสีเอกซ์พลังงานต่ำ' },
  { zone:'BODY SCANNER', question:'ข้อใดเป็นข้อเด่นของ Ultrasound เมื่อเทียบกับ CT?', options:['ใช้คลื่นเสียงและไม่มีรังสีเอกซ์','เห็นกระดูกทุกส่วนชัดกว่า CT','ใช้สนามแม่เหล็กแรงสูง','สร้างภาพได้เฉพาะภาพสามมิติ'], answer:0, explain:'Ultrasound ใช้คลื่นเสียง ไม่ใช้รังสีเอกซ์ และสามารถแสดงภาพแบบ real-time ได้' },

  { zone:'MEDTECH ENGINEER', question:'ชิ้นส่วนใดทำหน้าที่รับแสงใน Pulse Oximeter?', options:['Photodetector','Buzzer','Relay','Motor'], answer:0, explain:'Photodetector รับแสงที่ผ่านเนื้อเยื่อ แล้วแปลงเป็นสัญญาณไฟฟ้า' },
  { zone:'MEDTECH ENGINEER', question:'ส่วนใดประมวลผลสัญญาณจากเซนเซอร์ในอุปกรณ์?', options:['Battery','Microcontroller','ตัวเรือน','สายรัด'], answer:1, explain:'Microcontroller อ่าน ประมวลผล และควบคุมการทำงานของระบบอิเล็กทรอนิกส์' },
  { zone:'MEDTECH ENGINEER', question:'LED ใน Pulse Oximeter มีหน้าที่หลักอย่างไร?', options:['เก็บข้อมูล','ส่งแสงผ่านเนื้อเยื่อ','แสดงผลตัวเลข','จ่ายไฟให้ระบบ'], answer:1, explain:'LED ส่งแสงสีแดงและอินฟราเรดผ่านปลายนิ้วเพื่อใช้วิเคราะห์การดูดกลืนแสง' },
  { zone:'MEDTECH ENGINEER', question:'วงจรใดช่วยแปลงสัญญาณแอนะล็อกจากเซนเซอร์เป็นข้อมูลดิจิทัล?', options:['ADC','Relay','Fuse','Transformer'], answer:0, explain:'ADC (Analog-to-Digital Converter) แปลงแรงดันแอนะล็อกเป็นค่าดิจิทัลให้ไมโครคอนโทรลเลอร์ประมวลผล' },
  { zone:'MEDTECH ENGINEER', question:'แบตเตอรี่ในอุปกรณ์การแพทย์แบบพกพามีหน้าที่ใด?', options:['เป็นแหล่งจ่ายพลังงาน','ตรวจจับคลื่นเสียง','ประมวลผลภาพ','วัดอุณหภูมิ'], answer:0, explain:'แบตเตอรี่จ่ายพลังงานไฟฟ้าให้วงจรและส่วนแสดงผลของอุปกรณ์' },
  { zone:'MEDTECH ENGINEER', question:'เหตุใดอุปกรณ์แพทย์จึงต้องมีการทดสอบความปลอดภัยทางไฟฟ้า?', options:['เพื่อลดความเสี่ยงไฟฟ้าช็อกและกระแสรั่ว','เพื่อเพิ่มสีสันหน้าจอ','เพื่อให้เครื่องมีน้ำหนักมากขึ้น','เพื่อเพิ่มความเร็ว Wi-Fi'], answer:0, explain:'การทดสอบช่วยประเมินความเสี่ยงจากไฟฟ้าช็อก กระแสรั่ว และความผิดปกติทางไฟฟ้า' },

  { zone:'INNOVATION LAB', question:'เซนเซอร์ใดเหมาะกับการตรวจจับการเคลื่อนไหวและความเร่ง?', options:['MPU6050','DS18B20','Load Cell','pH Sensor'], answer:0, explain:'MPU6050 ประกอบด้วย Accelerometer และ Gyroscope สำหรับวัดความเร่งและการหมุน' },
  { zone:'INNOVATION LAB', question:'ระบบ IoT ทางการแพทย์ควรให้ความสำคัญกับเรื่องใด?', options:['สีของอุปกรณ์เท่านั้น','ความปลอดภัยและความเป็นส่วนตัวของข้อมูล','จำนวน Animation','ความเร็วอินเทอร์เน็ตอย่างเดียว'], answer:1, explain:'ข้อมูลสุขภาพมีความอ่อนไหว ต้องออกแบบการรักษาความลับ ความถูกต้อง และการควบคุมสิทธิ์เข้าถึง' },
  { zone:'INNOVATION LAB', question:'ข้อใดเป็นตัวอย่างการใช้ข้อมูลจากอุปกรณ์สวมใส่?', options:['ติดตามแนวโน้มชีพจร','ยืนยันโรคได้ทุกชนิด','แทนการตรวจแพทย์ทั้งหมด','วัดความดันโดยไม่ใช้เซนเซอร์'], answer:0, explain:'อุปกรณ์สวมใส่ช่วยติดตามแนวโน้มข้อมูลสุขภาพ แต่ไม่ควรใช้แทนการวินิจฉัยทางคลินิก' },
  { zone:'INNOVATION LAB', question:'เหตุใดระบบติดตามผู้ป่วยทางไกลจึงควรมีระบบแจ้งเตือนเมื่ออุปกรณ์ขาดการเชื่อมต่อ?', options:['เพื่อให้ทราบว่าข้อมูลอาจไม่ถูกส่งเข้าระบบ','เพื่อทำให้แบตเตอรี่หมดเร็ว','เพื่อปิดการทำงานเซนเซอร์','เพื่อเพิ่มความละเอียดภาพ'], answer:0, explain:'การแจ้งเตือนช่วยให้ผู้ดูแลทราบช่วงเวลาที่ไม่มีข้อมูล และตรวจสอบการเชื่อมต่อได้' },
  { zone:'INNOVATION LAB', question:'การออกแบบอุปกรณ์สำหรับผู้สูงอายุควรคำนึงถึงสิ่งใด?', options:['ตัวอักษรเล็กและเมนูซับซ้อน','ปุ่มชัดเจน อ่านง่าย และใช้งานไม่ซับซ้อน','ใช้สีเหมือนกันทุกปุ่ม','ซ่อนคำแนะนำทั้งหมด'], answer:1, explain:'หลักการออกแบบที่เข้าถึงได้ควรใช้ตัวอักษรอ่านง่าย ปุ่มชัดเจน และลดขั้นตอนที่ไม่จำเป็น' },
  { zone:'INNOVATION LAB', question:'ข้อมูลจากเซนเซอร์ควรผ่านขั้นตอนใดก่อนนำไปแสดงผล?', options:['ตรวจสอบและประมวลผลสัญญาณ','สุ่มเปลี่ยนค่า','ลบหน่วยวัด','ส่งต่อโดยไม่ตรวจสอบ'], answer:0, explain:'การตรวจสอบและประมวลผลช่วยลดสัญญาณรบกวนและทำให้ข้อมูลเหมาะสมต่อการนำเสนอ' }
];

const tileKinds: TileKind[] = ['start','knowledge','mission','bonus','knowledge','event','challenge','knowledge','mission','bonus','knowledge','event','challenge','knowledge','mission','bonus','knowledge','event','challenge','knowledge','mission','bonus','challenge','final'];
const tiles: Tile[] = tileKinds.map((kind, id) => ({ id, kind, zone: zones[Math.min(3, Math.floor(Math.max(0,id-1)/6))] }));
const kindSymbols: Record<TileKind,string> = { start:'🚩', knowledge:'💡', mission:'🧩', bonus:'⭐', event:'⚡', challenge:'🔥', final:'🏆' };
const zoneForTile = (id:number) => zones[Math.min(3,Math.floor(Math.max(0,id-1)/6))];

// Prefer a question from the current zone, then draw from the remaining bank.
// Questions are never repeated during the same run, and answer positions are shuffled.
const pickQuestion = (zone:Zone, used:number[]) => {
  const unused = questions.map((q,i)=>({q,i})).filter(x=>!used.includes(x.i));
  const local = unused.filter(x=>x.q.zone===zone);
  const pool = local.length ? local : unused;
  const selected = pool[Math.floor(Math.random()*pool.length)];
  const shuffled = selected.q.options.map((option,index)=>({option,index})).sort(()=>Math.random()-0.5);
  return {
    q:{...selected.q,options:shuffled.map(x=>x.option),answer:shuffled.findIndex(x=>x.index===selected.q.answer)},
    i:selected.i
  };
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
  const [startedAt,setStartedAt] = useState<number>(0);
  const moveTimer = useRef<number|undefined>(undefined);

  const currentZone = zoneForTile(position);
  const progress = Math.round((position/(tiles.length-1))*100);
  const boardRows = useMemo(()=>Array.from({length:6},(_,row)=>Array.from({length:4},(_,col)=>{
    const index = row%2===0 ? row*4+col : row*4+(3-col);
    return tiles[index];
  })),[]);

  const begin = () => {
    window.clearTimeout(moveTimer.current);
    setPosition(0); setTurn(0); setScore(0); setStreak(0); setBadges([]); setUsed([]);
    setDie(null); setQuestion(null); setQuestionIndex(null); setFeedback(null);
    setStartedAt(Date.now()); setRolling(false); setPhase('playing');
  };

  const endGame = () => { setQuestion(null); setFeedback(null); setRolling(false); setPhase('result'); };

  const resolveTile = (next:number) => {
    const tile = tiles[next];
    if (tile.kind==='bonus') {
      setScore(s=>s+80); setFeedback({title:'BONUS SPACE!',body:'พบ Energy Crystal รับคะแนนพิเศษ +80 คะแนน',points:80});
      return;
    }
    if (tile.kind==='event') {
      const events = [
        {title:'ระบบสำรองพลังงาน!',body:'จัดการพลังงานได้ดี รับคะแนนเพิ่ม +40',points:40},
        {title:'ทีมวิจัยช่วยเหลือ!',body:'ได้รับคำใบ้จากทีมผู้เชี่ยวชาญ รับคะแนนเพิ่ม +30',points:30},
        {title:'เส้นทางลัด!',body:'ค้นพบข้อมูลที่ช่วยให้ภารกิจง่ายขึ้น รับคะแนนเพิ่ม +50',points:50}
      ];
      const event=events[Math.floor(Math.random()*events.length)];
      setScore(s=>s+event.points); setFeedback(event);
      return;
    }
    const {q,i}=pickQuestion(tile.zone,used);
    if (!q) { setFeedback({title:'ภารกิจครบแล้ว!',body:'คุณตอบคำถามครบทุกข้อในคลังแล้ว ไปต่อสู่สรุปผลกันเลย'}); return; }
    setQuestion(q); setQuestionIndex(i);
  };

  const roll = () => {
    if (rolling || question || feedback || phase!=='playing') return;
    setRolling(true);
    moveTimer.current=window.setTimeout(()=>{
      const value=1+Math.floor(Math.random()*4);
      const target=Math.min(tiles.length-1,position+value);
      setDie(value); setTurn(t=>t+1);
      const advance=(at:number)=>{
        if(at>=target){
          setPosition(target);
          setRolling(false);
          resolveTile(target);
          return;
        }
        const next=at+1;
        setPosition(next);
        moveTimer.current=window.setTimeout(()=>advance(next),165);
      };
      advance(position);
    },520);
  };

  const answer = (choice:number) => {
    if (!question || questionIndex===null) return;
    const correct=choice===question.answer;
    const gained=correct ? 100+(streak>=2?25:0) : 0;
    if(correct){setScore(s=>s+gained);setStreak(s=>s+1);setBadges(old=>old.includes(question.zone)?old:[...old,question.zone]);}
    else {setStreak(0);}
    setUsed(old=>[...old,questionIndex]);
    setFeedback({title:correct?'ตอบถูกต้อง!':'ยังไม่ถูกต้อง',body:question.explain,correct,points:gained,answer:question.options[question.answer]});
    setQuestion(null);
  };

  const continueTurn = () => {
    if(position>=tiles.length-1 || turn>=12){endGame();return;}
    setFeedback(null);setDie(null);
  };

  const restart = () => {
    window.clearTimeout(moveTimer.current);
    setPhase('home');setPosition(0);setTurn(0);setScore(0);setStreak(0);setBadges([]);setUsed([]);setDie(null);setQuestion(null);setFeedback(null);setRolling(false);
  };

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={restart}><span className="brand-mark"><HeartPulse size={21}/></span><span>HEALTH TECH <b>ADVENTURE</b></span></button>
      <div className="top-actions"><span className="mode-pill">SOLO QUEST</span><button className="sound-btn" type="button">2D BOARD GAME</button></div>
    </header>
    <main>
      {phase==='home' && <section className="intro">
        <div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> NEURO-LINK ESTABLISHED • SOLO OPERATION</div>
          <h1>ภารกิจช่วยชีวิต<br/><span>เริ่มต้นที่นี่</span></h1>
          <p>ระบบ Medical AI ตรวจพบสัญญาณผิดปกติในศูนย์วิจัย คุณคือ MedTech Operative คนเดียวที่ต้องเปิดใช้งานอุปกรณ์ วิเคราะห์ข้อมูล และกู้คืนระบบทั้ง 4 โซน</p>
          <div className="intro-stats"><div><Clock3/><b>5–8 นาที</b><small>MISSION TIME</small></div><div><Map/><b>4 ZONES</b><small>RESEARCH SECTORS</small></div><div><Trophy/><b>12 TURNS</b><small>OPERATION LIMIT</small></div></div>
          <button className="primary start-button" onClick={begin}>เริ่มปฏิบัติการ <ArrowRight size={18}/></button>
          <p className="micro-note">ไม่ต้องสมัครสมาชิก • เล่นผ่านมือถือ • TRAINING SIMULATION</p>
        </div>
        <div className="cyber-scene">
          <div className="scene-topline"><span><i/> SYSTEM ONLINE</span><span>MEDTECH FACILITY // 04</span></div>
          <div className="holo-stage"><div className="scan-ring ring-one"/><div className="scan-ring ring-two"/><div className="scan-ring ring-three"/>
            <div className="holo-core"><HeartPulse size={76}/><span>MED<br/>CORE</span></div>
            <div className="orbit-node node-a"><Activity size={20}/><small>VITALS</small></div><div className="orbit-node node-b"><Brain size={20}/><small>IMAGING</small></div><div className="orbit-node node-c"><Wrench size={20}/><small>DEVICE</small></div>
            <div className="scene-crosshair">+</div>
          </div>
          <div className="scene-readout"><div><small>FACILITY STATUS</small><b>CRITICAL SYSTEMS</b></div><div><small>MISSION PROGRESS</small><b>0 / 4 ZONES</b></div><div className="signal-bars"><i/><i/><i/><i/><i/></div></div>
          <div className="scene-bottomline">SECURE CONNECTION <span>ENCRYPTED // 256-BIT</span></div>
        </div>
      </section>}

      {phase==='playing' && <section className="quest-layout">
        <div className="quest-head"><div><div className="eyebrow">OPERATION CONTROL // LIVE FEED</div><h1>MEDTECH FACILITY</h1><p>กู้คืนระบบทั้ง 4 โซน ก่อนพลังงานสำรองหมด</p></div><button className="exit-btn" onClick={restart}><RotateCcw size={15}/> ออกจากเกม</button></div>
        <div className="hud">
          <div className="hud-item"><small>คะแนน</small><b>{score.toLocaleString('th-TH')}</b></div>
          <div className="hud-item"><small>เทิร์น</small><b>{turn}/12</b></div>
          <div className="hud-item"><small>ตำแหน่ง</small><b>{position+1}/24</b></div>
          <div className="hud-item"><small>ตราความเชี่ยวชาญ</small><b>{badges.length}/4</b></div>
        </div>
        <div className="quest-columns">
          <div className="board-panel">
            <div className="board-title"><span><Activity size={17}/> HOLOGRAPHIC SECTOR MAP</span><span>SYNC {progress}%</span></div>
            <div className="board-progress"><i style={{width:progress+'%'}}/></div>
            <div className="board-grid">{boardRows.map((row,r)=><div className="board-row" key={r}>{row.map(tile=><div key={tile.id} className={'board-tile '+tile.kind+(position===tile.id?' active':'')} style={{'--zone-color':zoneColors[zones.indexOf(tile.zone)]} as React.CSSProperties}>
              <span className="tile-number">{tile.id===0?'START':tile.id===23?'FINISH':String(tile.id).padStart(2,'0')}</span><span className="tile-symbol">{kindSymbols[tile.kind]}</span>{position===tile.id&&<span className="player-token">🧑‍🚀</span>}
            </div>)}</div>)}</div>
            <div className="zone-legend">{zones.map((z,i)=>{const ZIcon=zoneIcons[i];return <span key={z}><i style={{background:zoneColors[i]}}/><ZIcon size={13}/>{z}</span>;})}</div>
          </div>
          <aside className="side-panel">
            <div className="zone-card"><div className="eyebrow">ACTIVE SECTOR // {String(zones.indexOf(currentZone)+1).padStart(2,'0')}</div><h3>{currentZone}</h3><p>{['เลือกใช้อุปกรณ์ให้เหมาะกับสถานการณ์','สำรวจเทคโนโลยีภาพวินิจฉัย','เรียนรู้ส่วนประกอบและระบบอิเล็กทรอนิกส์','ประยุกต์ความรู้สู่การสร้างนวัตกรรม'][zones.indexOf(currentZone)]}</p></div>
            <div className="dice-card"><div className="eyebrow">NAVIGATION MODULE</div><div className={'dice-face'+(rolling?' rolling':'')}>{rolling?'🎲':die?['⚀','⚁','⚂','⚃'][die-1]:'🎲'}</div><p>{rolling?'กำลังเคลื่อนย้ายหน่วยปฏิบัติการ...':die?'ผลการสุ่ม: '+die+' sectors':'รอคำสั่งเริ่มเคลื่อนที่'}</p><button className="primary roll-button" onClick={roll} disabled={rolling||!!question||!!feedback}>{rolling?'กำลังเคลื่อนที่...':'INITIATE MOVE'} <Dices size={18}/></button></div>
            <div className="badge-card"><div className="eyebrow">ZONE BADGES</div><div className="badge-list">{zones.map((z,i)=>{const ZIcon=zoneIcons[i];return <span key={z} className={badges.includes(z)?'earned':''}><ZIcon size={16}/><small>{z}</small>{badges.includes(z)&&<CheckCircle2 size={13}/>}</span>;})}</div></div>
          </aside>
        </div>
        {question && <div className="modal-backdrop"><div className="mission-modal"><div className="modal-top"><span className="eyebrow"><Sparkles size={13}/> {question.zone} • MISSION</span><span className="challenge-label">{tiles[position].kind.toUpperCase()}</span></div><h2>{question.question}</h2><div className="option-list">{question.options.map((opt,i)=><button key={opt} className="option-button" onClick={()=>answer(i)}><b>{String.fromCharCode(65+i)}</b>{opt}<ArrowRight size={15}/></button>)}</div><p className="modal-note">ตอบถูก รับ 100 คะแนน • คำถามสุ่มและไม่ซ้ำภายในรอบนี้</p></div></div>}
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
