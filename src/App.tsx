import { useState } from 'react';
import { Activity, HeartPulse, ScanLine, Wrench, Trophy, ArrowLeft, Sparkles, Clock3, RotateCcw } from 'lucide-react';

type GameId = 'er' | 'body' | 'builder';
const games = [
  { id: 'er' as const, title: 'ER HERO', subtitle: 'ภารกิจกู้ชีพ', desc: 'เลือกเครื่องมือแพทย์ให้เหมาะกับสถานการณ์', icon: Activity, tag: 'DECISION ARCADE', art: '🚑' },
  { id: 'body' as const, title: 'BODY SCANNER', subtitle: 'ไขปริศนาร่างกาย', desc: 'จับคู่โจทย์การตรวจกับเทคโนโลยีภาพวินิจฉัย', icon: ScanLine, tag: 'MEDICAL MYSTERY', art: '🧬' },
  { id: 'builder' as const, title: 'MEDTECH BUILDER', subtitle: 'วิศวกรเครื่องมือแพทย์', desc: 'เรียนรู้ชิ้นส่วนสำคัญของเครื่องมือแพทย์', icon: Wrench, tag: 'ENGINEERING PUZZLE', art: '🛠️' }
];
const questions: Record<GameId, { q: string; opts: string[]; a: number; why: string }[]> = {
  er: [
    { q: 'ต้องการวัดความดันโลหิต ควรเลือกอุปกรณ์ใด?', opts: ['เครื่องวัดความดัน', 'Pulse Oximeter', 'ECG', 'เครื่องวัดอุณหภูมิ'], a: 0, why: 'เครื่องวัดความดันใช้วัดค่า Systolic และ Diastolic blood pressure' },
    { q: 'ต้องการประเมินความอิ่มตัวของออกซิเจนในเลือด ควรใช้อุปกรณ์ใด?', opts: ['ECG', 'Pulse Oximeter', 'เครื่องวัดความดัน', 'เครื่องชั่งน้ำหนัก'], a: 1, why: 'Pulse Oximeter ใช้แสงประเมินค่า SpO₂ และชีพจร' },
    { q: 'ต้องการบันทึกคลื่นไฟฟ้าหัวใจ ควรใช้อุปกรณ์ใด?', opts: ['Thermometer', 'Ultrasound', 'ECG', 'Glucometer'], a: 2, why: 'ECG บันทึกกิจกรรมทางไฟฟ้าของหัวใจผ่านขั้วไฟฟ้า' }
  ],
  body: [
    { q: 'ต้องการตรวจภาพกระดูกเพื่อดูรอยหักเบื้องต้น เลือกเทคโนโลยีใด?', opts: ['MRI', 'X-ray', 'Ultrasound', 'ECG'], a: 1, why: 'X-ray ใช้รังสีเอกซ์สร้างภาพ โดยกระดูกดูดกลืนรังสีได้มากกว่าเนื้อเยื่ออ่อน' },
    { q: 'ต้องการภาพสมองที่มีรายละเอียดเนื้อเยื่ออ่อนสูง โดยไม่ใช้รังสีเอกซ์ เลือกอะไร?', opts: ['MRI', 'X-ray', 'เครื่องวัดความดัน', 'Pulse Oximeter'], a: 0, why: 'MRI ใช้สนามแม่เหล็กและคลื่นวิทยุ ไม่ใช้รังสีเอกซ์' },
    { q: 'ต้องการตรวจดูทารกในครรภ์แบบเรียลไทม์ ควรเลือกอะไร?', opts: ['CT Scan', 'ECG', 'Ultrasound', 'X-ray'], a: 2, why: 'Ultrasound ใช้คลื่นเสียงความถี่สูงสร้างภาพแบบเรียลไทม์' }
  ],
  builder: [
    { q: 'Pulse Oximeter ใช้ชิ้นส่วนใดตรวจจับแสงที่ผ่านปลายนิ้ว?', opts: ['LED และ Photodetector', 'ลำโพง', 'มอเตอร์สั่น', 'เสาอากาศ Wi-Fi'], a: 0, why: 'LED ส่งแสงผ่านเนื้อเยื่อ และ Photodetector รับแสงเพื่อประมวลผล' },
    { q: 'ส่วนใดทำหน้าที่ประมวลผลสัญญาณจากเซนเซอร์?', opts: ['ตัวเรือน', 'ไมโครคอนโทรลเลอร์', 'สายคล้อง', 'ปุ่มเปิดเครื่อง'], a: 1, why: 'ไมโครคอนโทรลเลอร์อ่านและประมวลผลสัญญาณจากวงจรเซนเซอร์' },
    { q: 'ส่วนใดใช้แสดงค่า SpO₂ และชีพจรให้ผู้ใช้เห็น?', opts: ['หน้าจอแสดงผล', 'แบตเตอรี่', 'คลิปหนีบ', 'เลนส์กล้อง'], a: 0, why: 'หน้าจอแสดงค่าที่ผ่านการประมวลผลแล้ว' }
  ]
};
type Result = { id: GameId; score: number };
export default function App() {
  const [active, setActive] = useState<GameId | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [feedback, setFeedback] = useState(false);
  const [sound, setSound] = useState(false);
  const current = games.find(g => g.id === active);
  const Icon = current?.icon ?? HeartPulse;
  const qs = active ? questions[active] : [];
  const q = active ? qs[step] : null;
  const total = results.reduce((sum, r) => sum + r.score, 0);
  const start = (id: GameId) => { setActive(id); setStep(0); setAnswers([]); setFeedback(false); };
  const finish = (id: GameId) => {
    const correct = answers.filter((a, i) => a === questions[id][i].a).length;
    setResults(old => [...old.filter(r => r.id !== id), { id, score: correct * 100 + (correct === 3 ? 50 : 0) }]);
    setActive(null); setStep(0); setAnswers([]); setFeedback(false);
  };
  const next = () => {
    if (!active) return;
    if (step === 2) finish(active);
    else { setStep(s => s + 1); setFeedback(false); }
  };
  const reset = () => { setResults([]); setActive(null); setStep(0); setAnswers([]); setFeedback(false); };
  return <div className="app-shell">
    <header className="topbar"><div className="brand" onClick={() => setActive(null)}><span className="brand-mark"><HeartPulse size={21}/></span><span>HEALTH TECH <b>ARCADE</b></span></div><button className="sound-btn" onClick={() => setSound(v => !v)}>เสียง: {sound ? 'เปิด' : 'ปิด'}</button></header>
    <main>
      {active && q ? <section className="game-screen">
        <button className="back-link" onClick={() => setActive(null)}><ArrowLeft size={16}/> กลับหน้าเกม</button>
        <div className="game-heading"><span className="game-icon"><Icon size={25}/></span><div><div className="eyebrow">{current?.tag}</div><h1>{current?.title}</h1><p>{current?.subtitle}</p></div></div>
        <div className="progress-row"><span>ภารกิจ {step + 1} / 3</span><span>{Math.round(((step + 1) / 3) * 100)}%</span></div><div className="progress"><i style={{ width: `${((step + 1) / 3) * 100}%` }}/></div>
        <div className="question-card"><div className="eyebrow">YOUR MISSION</div><h2>{q.q}</h2><div className="answer-grid">{q.opts.map((option, i) => <button key={option} className={feedback && i === q.a ? 'answer correct' : feedback && answers[step] === i ? 'answer wrong' : 'answer'} onClick={() => { if (!feedback) { setAnswers(old => [...old, i]); setFeedback(true); } }} disabled={feedback}><span className="answer-letter">{String.fromCharCode(65 + i)}</span>{option}</button>)}</div>
          {feedback && <div className={answers[step] === q.a ? 'feedback good' : 'feedback bad'}><b>{answers[step] === q.a ? 'ถูกต้อง! +100 คะแนน' : 'ยังไม่ถูกต้อง ลองเรียนรู้จากเฉลย'}</b><p>{q.why}</p><button className="primary small" onClick={next}>{step === 2 ? 'ดูผลคะแนน' : 'ภารกิจถัดไป'} →</button></div>}
        </div><p className="disclaimer">เกมจำลองเพื่อการเรียนรู้ ไม่ใช่เครื่องมือวินิจฉัยหรือแนะนำการรักษา</p>
      </section> : <>
        <section className="hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> PLAY • LEARN • EXPLORE</div><h1>โลกของ <span>Health Tech</span><br/>รอให้คุณมาท้าทาย!</h1><p>3 ภารกิจสุดมันส์ ที่จะพาคุณไปรู้จักเทคโนโลยีสุขภาพ ผ่านเกมที่เล่นง่ายและได้ความรู้จริง</p><button className="primary" onClick={() => document.getElementById('missions')?.scrollIntoView({ behavior: 'smooth' })}>เริ่มภารกิจ <span>→</span></button><div className="hero-meta"><span><Clock3 size={15}/> 3–5 นาที</span><span><Trophy size={15}/> สะสมคะแนน</span><span>📱 เล่นบนมือถือได้</span></div></div>
          <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-core"><HeartPulse size={82}/><span>HEALTH<br/>TECH</span></div><div className="float-card card-a">🫀 <small>ECG</small></div><div className="float-card card-b">🧬 <small>SCAN</small></div><div className="float-card card-c">🩺 <small>MEDTECH</small></div></div>
        </section>
        <section id="missions" className="missions"><div className="section-title"><div><div className="eyebrow">CHOOSE YOUR MISSION</div><h2>เลือกภารกิจของคุณ</h2></div><span className="mission-count">03 MISSIONS</span></div><div className="game-grid">{games.map(g => { const GameIcon = g.icon; const done = results.find(r => r.id === g.id); return <article className="game-card" key={g.id}><div className="card-top"><span className="game-icon"><GameIcon size={27}/></span><span className="game-time"><Clock3 size={13}/> 60–90 วินาที</span></div><div className="game-art">{g.art}</div><div className="eyebrow">{g.tag}</div><h3>{g.title}</h3><h4>{g.subtitle}</h4><p>{g.desc}</p><button className={done ? 'secondary' : 'play-btn'} onClick={() => start(g.id)}>{done ? `เล่นอีกครั้ง · ${done.score} คะแนน` : 'เล่นเกมนี้ →'}</button></article>; })}</div></section>
        <section className="score-strip"><div><div className="eyebrow">YOUR ARCADE STATUS</div><h2>ความสำเร็จของคุณ</h2><p>เล่นครบทั้ง 3 ภารกิจ เพื่อปลดล็อกคำเชิญพิเศษที่บูธ</p></div><div className="score-stats"><div><b>{results.length}/3</b><small>ภารกิจ</small></div><div><b>{total}</b><small>คะแนนรวม</small></div></div></section>
        {results.length === 3 && <section className="reward-panel"><Trophy size={38}/><div><div className="eyebrow">ALL MISSIONS COMPLETE</div><h2>สุดยอด! คุณคือ Health Tech Explorer</h2><p>คุณทำได้ {total} คะแนน มาทำภารกิจจริงและรับของที่ระลึกที่บูธ</p></div><span className="reward-label">BOOTH REWARD</span></section>}
        <section className="booth-cta"><div><div className="eyebrow">THE REAL EXPERIENCE IS WAITING</div><h2>เกมจบแล้ว...แต่ความสนุกยังไม่จบ!</h2><p>มาลองสัมผัสเครื่องมือแพทย์จริง ทดลองเทคโนโลยี และพบกับทีม Health Technology ที่บูธของเรา</p></div><div className="cta-symbol">🏥</div></section>
        <section className="notice">ข้อมูลและค่าต่าง ๆ ในเกมเป็นสถานการณ์จำลองเพื่อการศึกษา ไม่ใช้แทนคำแนะนำจากบุคลากรทางการแพทย์</section>
      </>}
    </main>
    <footer><span>HEALTH TECH ARCADE</span><span>PLAY • LEARN • EXPLORE</span><button onClick={reset}><RotateCcw size={13}/> รีเซ็ตคะแนน</button></footer>
  </div>;
}
