import { useState, useEffect } from "react";

export default function Winder({ currentAngle, onWind, onDragStart, onDragEnd }) {
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseAngle, setLastMouseAngle] = useState(0);

  const GEAR_SIZE = 150;
  const HANDLE_SIZE = 250;

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
    <div
      id="winder-container"
      onMouseDown={handleMouseDown}
      style={{
        width: Math.max(GEAR_SIZE, HANDLE_SIZE) + "px",
        height: Math.max(GEAR_SIZE, HANDLE_SIZE) + "px",
        position: "relative",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
    >
      <img
        src="/gear.png"
        alt=""
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: GEAR_SIZE + "px",
          height: GEAR_SIZE + "px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) rotate(${currentAngle}deg)`,
          width: HANDLE_SIZE + "px",
          height: HANDLE_SIZE + "px",
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