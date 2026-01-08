import { useState, useEffect } from "react";

export default function Winder({ currentAngle, onWind, onDragStart, onDragEnd }) {
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseAngle, setLastMouseAngle] = useState(0);

  // ★設定：ここでそれぞれの大きさを決めます（px単位）
  const GEAR_SIZE = 150;   // ギアの大きさ
  const HANDLE_SIZE = 250; // ハンドルの大きさ

  // 角度計算ロジック
  const getMouseAngle = (clientX, clientY, element) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - centerY, clientX - centerX);
    return rad * (180 / Math.PI);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setLastMouseAngle(getMouseAngle(e.clientX, e.clientY, e.currentTarget));
    if (onDragStart) onDragStart();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const element = document.getElementById("winder-container");
      if (!element) return;

      const newMouseAngle = getMouseAngle(e.clientX, e.clientY, element);
      let diff = newMouseAngle - lastMouseAngle;

      if (diff < -180) diff += 360;
      if (diff > 180) diff -= 360;

      if (diff > 0) onWind(diff);

      setLastMouseAngle(newMouseAngle);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (onDragEnd) onDragEnd();
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, lastMouseAngle, onWind, onDragEnd]);

  return (
    // コンテナ（基準点）
    <div
      id="winder-container"
      onMouseDown={handleMouseDown}
      style={{
        // 基準点のサイズは「大きい方」に合わせておくのが無難です
        width: Math.max(GEAR_SIZE, HANDLE_SIZE) + "px",
        height: Math.max(GEAR_SIZE, HANDLE_SIZE) + "px",
        position: "relative",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        
        // ★場所を変えたい時はここをいじります（例：右に50px、下に20pxずらす）
        // transform: "translate(50px, 20px)", 
      }}
    >
      {/* ギア画像 */}
      <img
        src="/gear.png"
        alt=""
        style={{
          position: "absolute",
          // 真ん中合わせの呪文
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          
          width: GEAR_SIZE + "px",   // 個別のサイズ適用
          height: GEAR_SIZE + "px",  // 個別のサイズ適用
          pointerEvents: "none",
        }}
      />

      {/* ハンドル画像 */}
      <div
        style={{
          position: "absolute",
          // 真ん中合わせの呪文
          top: "50%",
          left: "50%",
          // 回転させつつ、中心も合わせる
          transform: `translate(-50%, -50%) rotate(${currentAngle}deg)`,
          
          width: HANDLE_SIZE + "px",  // 個別のサイズ適用
          height: HANDLE_SIZE + "px", // 個別のサイズ適用
          
          backgroundImage: "url(/handle.png)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
          transition: isDragging ? "none" : "transform 0.1s linear",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}