import React, { useEffect, useRef, useState } from "react";
import RotatingText from "./RotatingText.jsx";

const VIEWS = {
  HOME: "home",
  MUSIMAP: "musimap",
  ABOUT: "about",
};

function useMusiMapZoom(mapRef, canvasRef) {
  useEffect(() => {
    const mapEl = mapRef.current;
    const canvasEl = canvasRef.current;
    if (!mapEl || !canvasEl) return;

    let scale = 1;
    const MIN_SCALE = 0.7;
    const MAX_SCALE = 2.2;

    const applyScale = () => {
      canvasEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
    };

    const onWheel = (event) => {
      event.preventDefault();
      const delta = event.deltaY;
      const step = 0.12;
      if (delta > 0) {
        scale = Math.max(MIN_SCALE, scale - step);
      } else {
        scale = Math.min(MAX_SCALE, scale + step);
      }
      applyScale();
    };

    let pinchStartDistance = null;
    let pinchStartScale = 1;

    const getDistance = (touch1, touch2) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (event) => {
      if (event.touches.length === 2) {
        pinchStartDistance = getDistance(event.touches[0], event.touches[1]);
        pinchStartScale = scale;
      }
    };

    const onTouchMove = (event) => {
      if (event.touches.length === 2 && pinchStartDistance) {
        event.preventDefault();
        const currentDistance = getDistance(
          event.touches[0],
          event.touches[1]
        );
        const factor = currentDistance / pinchStartDistance;
        scale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, pinchStartScale * factor)
        );
        applyScale();
      }
    };

    const onTouchEnd = () => {
      if (pinchStartDistance) {
        pinchStartDistance = null;
      }
    };

    mapEl.addEventListener("wheel", onWheel, { passive: false });
    mapEl.addEventListener("touchstart", onTouchStart, { passive: true });
    mapEl.addEventListener("touchmove", onTouchMove, { passive: false });
    mapEl.addEventListener("touchend", onTouchEnd);

    return () => {
      mapEl.removeEventListener("wheel", onWheel);
      mapEl.removeEventListener("touchstart", onTouchStart);
      mapEl.removeEventListener("touchmove", onTouchMove);
      mapEl.removeEventListener("touchend", onTouchEnd);
    };
  }, [mapRef, canvasRef]);
}

function App() {
  const [view, setView] = useState(VIEWS.HOME);
  const musiMapRef = useRef(null);
  const musiMapCanvasRef = useRef(null);

  useMusiMapZoom(musiMapRef, musiMapCanvasRef);

  // 뷰 전환 시 배경 색상 변경 (뷰별 컬러 조합)
  useEffect(() => {
    document.body.setAttribute("data-view", view);
  }, [view]);

  const changeView = (target) => {
    setView(target);
  };

  const isActive = (target) => view === target;

  return (
    <div className={`app app--${view}`}>
      <header className="app-header">
        <button
          className="brand"
          onClick={() => changeView(VIEWS.HOME)}
          aria-label="홈으로 이동"
        >
          <span className="brand-mark" />
          <span className="brand-name">TRAV</span>
        </button>
        <button
          className="cta-btn"
          onClick={() => changeView(VIEWS.MUSIMAP)}
          aria-label="MusiMap 보기"
        >
          MusiMap 열기
        </button>
      </header>

      <main className="app-main">
        <section
          className={`view ${isActive(VIEWS.HOME) ? "view--active" : ""}`}
          aria-label="홈"
          role="region"
        >
          <div className="hero">
            <p className="eyebrow">가볍게 떠나는 여행</p>
            <h1 className="headline">
              짐은 줄이고,
              <br />
              기억은 크게.
            </h1>
            <p className="subcopy">
              필요한 것만 담고,
              <br />
              나머지는 잊어도 좋아요.
            </p>
            <div className="hero-actions">
              <button
                className="btn btn--primary"
                onClick={() => changeView(VIEWS.ABOUT)}
                aria-label="트래브 소개 보기"
              >
                어떻게 도와줄까요?
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => changeView(VIEWS.HOME)}
                aria-label="홈 살펴보기"
              >
                지금 상상해 보기
              </button>
            </div>
          </div>

          <div className="cards">
            <article className="card">
              <h2>한눈에 일정</h2>
              <p>날짜, 장소, 해야 할 일. 한 화면에서 끝.</p>
            </article>
            <article className="card">
              <h2>가벼운 짐</h2>
              <p>여행지에 딱 맞는 체크리스트만.</p>
            </article>
            <article className="card">
              <h2>함께 공유</h2>
              <p>친구와 링크 하나로 일정 공유.</p>
            </article>
          </div>
        </section>

        <section
          className={`view ${isActive(VIEWS.MUSIMAP) ? "view--active" : ""}`}
          aria-label="MusiMap"
          role="region"
        >
          <div className="musimap">
            <div className="musimap-header">
              <div>
                <p className="eyebrow">MusiMap</p>
                <h1 className="headline">소리로 다시 걷는 지도.</h1>
              </div>
              <p className="musimap-note">
                여행지와 그때의 노래를 함께 꽂아두는 나만의 사운드 지도입니다.
              </p>
            </div>

            <div
              className="musimap-map"
              aria-label="여행 음악 지도"
              role="group"
              ref={musiMapRef}
            >
              <div className="musimap-controls" aria-label="지도 확대 축소">
                <button type="button" className="map-zoom-btn" aria-label="확대">
                  +
                </button>
                <button type="button" className="map-zoom-btn" aria-label="축소">
                  −
                </button>
              </div>

              <div className="musimap-canvas" ref={musiMapCanvasRef}>
                <button className="map-pin map-pin--left" type="button">
                  <div className="map-pin-thumb thumb--sea" />
                  <div className="map-pin-info">
                    <span className="map-pin-place">Busan Beach</span>
                    <span className="map-pin-track">Sunrise Drive</span>
                  </div>
                </button>

                <button className="map-pin map-pin--center" type="button">
                  <div className="map-pin-thumb thumb--city" />
                  <div className="map-pin-info">
                    <span className="map-pin-place">Tokyo Night</span>
                    <span className="map-pin-track">Neon Streets</span>
                  </div>
                </button>

                <button className="map-pin map-pin--right" type="button">
                  <div className="map-pin-thumb thumb--desert" />
                  <div className="map-pin-info">
                    <span className="map-pin-place">Sahara Camp</span>
                    <span className="map-pin-track">Warm Echoes</span>
                  </div>
                </button>
              </div>
            </div>

            <p className="musimap-footer">
              앞으로는, 여행을 떠날 때마다 한 곡씩 이 지도에 심게 됩니다.
            </p>
          </div>
        </section>

        <section
          className={`view ${isActive(VIEWS.ABOUT) ? "view--active" : ""}`}
          aria-label="서비스 소개"
          role="region"
        >
          <div className="about">
            <p className="eyebrow">ABOUT</p>
            <h1 className="headline">
              Website about My{" "}
              <RotatingText
                texts={["Life", "Travel", "Explore", "Study"]}
                mainClassName="about-rotating-main"
                staggerFrom="last"
                splitBy="characters"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-120%", opacity: 0 }}
                staggerDuration={0.025}
                splitLevelClassName="about-rotating-split"
                elementLevelClassName="about-rotating-char"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </h1>
            <p className="subcopy">
              복잡한 설정은 모두 줄였습니다.
              <br />
              터치 몇 번이면 여행 준비가 끝나요.
            </p>

            <div className="about-grid">
              <div className="about-item">
                <h3>모바일 중심</h3>
                <p>한 손으로도 충분히. 엄지 손가락 기준 터치 영역.</p>
              </div>
              <div className="about-item">
                <h3>키보드 친화적</h3>
                <p>탭, 엔터로 모든 메뉴에 바로 이동.</p>
              </div>
              <div className="about-item">
                <h3>즉각 반응</h3>
                <p>페이지 이동 없이 화면만 부드럽게 전환.</p>
              </div>
              <div className="about-item">
                <h3>집중되는 화면</h3>
                <p>필요 없는 건 줄이고, 중요한 것만 남겼습니다.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <nav className="app-nav" aria-label="주요 메뉴">
        <button
          className={`nav-item ${isActive(VIEWS.HOME) ? "nav-item--active" : ""}`}
          onClick={() => changeView(VIEWS.HOME)}
          aria-label="홈으로 이동"
        >
          <span className="nav-dot" />
          <span className="nav-label">Home</span>
        </button>
        <button
          className={`nav-item ${
            isActive(VIEWS.MUSIMAP) ? "nav-item--active" : ""
          }`}
          onClick={() => changeView(VIEWS.MUSIMAP)}
          aria-label="MusiMap으로 이동"
        >
          <span className="nav-dot" />
          <span className="nav-label">MusiMap</span>
        </button>
        <button
          className={`nav-item ${
            isActive(VIEWS.ABOUT) ? "nav-item--active" : ""
          }`}
          onClick={() => changeView(VIEWS.ABOUT)}
          aria-label="소개로 이동"
        >
          <span className="nav-dot" />
          <span className="nav-label">About</span>
        </button>
      </nav>
    </div>
  );
}

export default App;


