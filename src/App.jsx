import "./App.css";
import { useState, useEffect, useRef } from "react";
import Winder from "./components/Winder";

const songList = [
  { title: "曲1: G線上のアリア", file: "/song1.mp3" },
  { title: "曲2: カノン（パッヘルベル）",     file: "/song2.mp3" },
  { title: "曲3: 練習曲作品10-3", file: "/song3.mp3" },
  { title: "曲4: 夜想曲第2番",     file: "/song4.mp3" },
  { title: "曲5: 花のワルツ",     file: "/song5.mp3" },
];

const MAX_ROTATION_DEG = 3600; 

export default function App() {
  const [springEnergy, setSpringEnergy] = useState(0);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isWinding, setIsWinding] = useState(false);

  const audioRef = useRef(new Audio(songList[0].file));
  const rafRef = useRef(null);

  // ▼▼▼ 【追加場所 1】 ▼▼▼
  // カチッという音と、回転量を溜めるバケツを用意します
  const clickSoundRef = useRef(new Audio("/click.mp3"));
  const windAccumulatorRef = useRef(0);
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = false;
    const onLoadedMetadata = () => {
      if (audio.duration && audio.duration !== Infinity) {
        setDuration(audio.duration);
        audio.currentTime = audio.duration;
        setSpringEnergy(0);
      }
    };
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    if (audio.readyState >= 1) onLoadedMetadata();
    return () => audio.removeEventListener("loadedmetadata", onLoadedMetadata);
  }, [currentSongIndex]);

  useEffect(() => {
    const animate = () => {
      const audio = audioRef.current;
      
      if (!duration) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const remainingTime = duration - audio.currentTime;
      const currentEnergy = Math.max((remainingTime / duration) * 100, 0);
      setSpringEnergy(currentEnergy);

      const SLOW_START_AT = 8; 
      const MIN_SPEED = 0.8;

      if (currentEnergy < SLOW_START_AT && currentEnergy > 0) {
        const ratio = currentEnergy / SLOW_START_AT; 
        const rate = MIN_SPEED + (ratio * (1.0 - MIN_SPEED));
        audio.playbackRate = Math.max(rate, MIN_SPEED);
      } else {
        audio.playbackRate = 1.0;
      }

      if (audio.ended || currentEnergy <= 0.1 || isWinding) {
         if (!audio.paused) audio.pause();
      } else {
         if (audio.paused) audio.play().catch(e => console.log(e));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, isWinding]);


  // ▼▼▼ 【追加場所 2】handleWind全体を書き換え ▼▼▼
  const handleWind = (diffAngle) => {
    const audio = audioRef.current;
    if (!duration) return;

    // 1. 今まで通りの巻き戻し計算
    const chargeRatio = diffAngle / MAX_ROTATION_DEG;
    const rewindTime = chargeRatio * duration;
    audio.currentTime = Math.max(audio.currentTime - rewindTime, 0);

    // 2. ここから追加した「カチカチ音」の処理
    windAccumulatorRef.current += diffAngle; // 回した分を溜める

    // 「45度」溜まったら音を鳴らす
    const CLICK_THRESHOLD = 30; 

    if (windAccumulatorRef.current >= CLICK_THRESHOLD) {
      const click = clickSoundRef.current;
      
      // 音をリセット
      click.pause();
      click.currentTime = 0;
      
      // 音程をランダムに変える（リアル感）
      click.playbackRate = 0.9 + Math.random() * 0.2; 
      
      click.play().catch(e => {}); // 再生

      // 溜まった分をリセット
      windAccumulatorRef.current = 0; 
    }
  };
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲


  const handleDragStart = () => {
    setIsWinding(true);
    audioRef.current.pause();
  };

  const handleDragEnd = () => {
    setTimeout(() => {
      setIsWinding(false); 
    }, 100); 
  };

  const handleSongChange = (e) => {
    const newIndex = Number(e.target.value); 
    changeSong(newIndex);
  };

  const changeSong = (index) => {
    setCurrentSongIndex(index);
    const audio = audioRef.current;
    audio.pause();
    audio.src = songList[index].file;
    audio.load();
    setSpringEnergy(0);
  };

  const currentRotation = (springEnergy / 100) * MAX_ROTATION_DEG;

  return (
    <div className="music-box-container">
      
      <div className="control-panel">
        <p style={{fontSize: "0.9rem", opacity: 0.8}}>
          Power: {Math.floor(springEnergy)}%
        </p>
      </div>

      <div className="winder-area">
        <Winder 
          currentAngle={currentRotation} 
          onWind={handleWind}
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        />
        <p style={{
          position: "absolute", 
          bottom: "-40px", 
          fontSize: "0.8rem", 
          opacity: 0.7, 
          textShadow: "0 1px 3px black"
        }}>
          Wind up 10 times
        </p>
      </div>

      <div className="control-panel" style={{textAlign: "center"}}>
        <select 
          className="song-select"
          value={currentSongIndex}
          onChange={handleSongChange}
        >
          {songList.map((song, index) => (
            <option key={index} value={index}>
              ♪ {song.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}