// src/components/team/KoreaMapNaver.tsx
// 네이버 지도 API + KBO 구장 커스텀 오버레이
// 사용 전 index.html에 Naver Maps SDK 스크립트 추가 필요:
// <script src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_CLIENT_ID"></script>

import { useEffect, useRef, useState } from "react";
import { KBO_TEAMS, type Team } from "@/mock/teamData";

// ── 구장 좌표 매핑 (teamId → 위경도) ────────────────────────────
const STADIUM_COORDS: Record<string, { lat: number; lng: number }> = {
  kia: { lat: 35.168, lng: 126.8891 }, // 광주-기아 챔피언스 필드
  samsung: { lat: 35.8412, lng: 128.6814 }, // 대구 삼성 라이온즈 파크
  lg: { lat: 37.5122, lng: 127.0719 }, // 잠실야구장
  doosan: { lat: 37.5125, lng: 127.0722 }, // 잠실야구장 (LG와 동일, 약간 offset)
  lotte: { lat: 35.1938, lng: 129.0611 }, // 사직야구장
  hanwha: { lat: 36.3172, lng: 127.4295 }, // 한화생명 이글스파크
  ssg: { lat: 37.437, lng: 126.693 }, // SSG 랜더스필드
  kt: { lat: 37.299, lng: 127.0097 }, // 수원 KT 위즈파크
  nc: { lat: 35.2225, lng: 128.5826 }, // 창원 NC 파크
  kiwoom: { lat: 37.4985, lng: 126.8672 }, // 고척 스카이돔
};

interface KoreaMapNaverProps {
  onSelect: (team: Team) => void;
}

declare global {
  interface Window {
    naver: any;
  }
}

export default function KoreaMapNaver({ onSelect }: KoreaMapNaverProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const overlays = useRef<any[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // ── SDK 로드 감지 ──────────────────────────────────────────────
  useEffect(() => {
    const check = () => {
      if (window.naver?.maps) {
        setSdkReady(true);
        return;
      }
      setTimeout(check, 300);
    };
    check();
  }, []);

  // ── 지도 초기화 ───────────────────────────────────────────────
  useEffect(() => {
    if (!sdkReady || !mapRef.current || mapInstance.current) return;

    const map = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(36.5, 127.8),
      zoom: 7,
      minZoom: 6,
      maxZoom: 13,
      mapTypeId: window.naver.maps.MapTypeId.NORMAL,
      scaleControl: false,
      logoControl: false,
      mapDataControl: false,
    });
    mapInstance.current = map;

    // ── 구장마다 커스텀 오버레이 생성 ──────────────────────────
    KBO_TEAMS.forEach((team) => {
      const coord = STADIUM_COORDS[team.id];
      if (!coord) return;

      const pos = new window.naver.maps.LatLng(coord.lat, coord.lng);

      // 커스텀 오버레이 HTML
      const content = buildOverlayHTML(team, false);

      const overlay = new window.naver.maps.CustomOverlay({
        position: pos,
        content,
        anchor: new window.naver.maps.Point(28, 28),
        map,
      });

      // 마우스 이벤트
      const el = overlay.getElement?.();

      window.naver.maps.Event.addListener(overlay, "click", () => {
        onSelect(team);
      });

      // hover는 DOM 이벤트로
      const handleMouseOver = () => {
        setHoveredId(team.id);
        overlay.setContent(buildOverlayHTML(team, true));
      };
      const handleMouseOut = () => {
        setHoveredId(null);
        overlay.setContent(buildOverlayHTML(team, false));
      };

      // CustomOverlay는 getElement 대신 onAdd 후 DOM 접근
      const intervalId = setInterval(() => {
        const outerEl = (overlay as any).getElement
          ? (overlay as any).getElement()
          : null;
        if (outerEl) {
          outerEl.addEventListener("mouseover", handleMouseOver);
          outerEl.addEventListener("mouseout", handleMouseOut);
          outerEl.addEventListener("click", () => onSelect(team));
          clearInterval(intervalId);
        }
      }, 200);

      overlays.current.push(overlay);
    });

    return () => {
      overlays.current.forEach((o) => o.setMap(null));
      overlays.current = [];
    };
  }, [sdkReady, onSelect]);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
      {/* 지도 컨테이너 */}
      <div ref={mapRef} className="w-full h-full" />

      {/* SDK 로딩 중 */}
      {!sdkReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-3xl">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold">지도 로딩 중...</p>
          </div>
        </div>
      )}

      {/* 범례 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg">
        <p className="text-xs font-bold text-gray-600">
          ⚾ 구장을 클릭하여 팀 선택
        </p>
      </div>
    </div>
  );
}

// ── 커스텀 오버레이 HTML 생성 ────────────────────────────────────
function buildOverlayHTML(team: Team, hovered: boolean): string {
  const size = hovered ? 56 : 44;
  const shadow = hovered
    ? `0 8px 24px ${team.colors.primary}66`
    : `0 2px 8px ${team.colors.primary}33`;
  const scale = hovered ? "scale(1.15)" : "scale(1)";
  const zIndex = hovered ? 999 : 1;

  const innerStyle = `
    width:${size}px; height:${size}px;
    border-radius:50%;
    background:linear-gradient(135deg,${team.colors.primary},${team.colors.secondary === "#000000" ? team.colors.accent : team.colors.secondary});
    display:flex; align-items:center; justify-content:center;
    border:3px solid white;
    box-shadow:${shadow};
    cursor:pointer;
    transform:${scale};
    transition:all 0.2s ease;
    position:relative;
    z-index:${zIndex};
    font-size:${hovered ? 13 : 11}px;
    font-weight:900;
    color:${team.colors.text};
    font-family:sans-serif;
    user-select:none;
  `;

  const tooltipStyle = `
    position:absolute;
    bottom:calc(100% + 8px);
    left:50%;
    transform:translateX(-50%);
    background:${team.colors.primary};
    color:${team.colors.text};
    font-size:11px;
    font-weight:800;
    padding:4px 10px;
    border-radius:20px;
    white-space:nowrap;
    box-shadow:0 2px 8px rgba(0,0,0,0.2);
    pointer-events:none;
    font-family:sans-serif;
  `;

  const arrowStyle = `
    position:absolute;
    top:100%;
    left:50%;
    transform:translateX(-50%);
    border:5px solid transparent;
    border-top-color:${team.colors.primary};
    pointer-events:none;
  `;

  const tooltip = hovered
    ? `
    <div style="${tooltipStyle}">
      ${team.name}
      <div style="${arrowStyle}"></div>
    </div>
  `
    : "";

  return `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;">
      ${tooltip}
      <div style="${innerStyle}">
        ${team.shortName.slice(0, 2)}
      </div>
    </div>
  `;
}
