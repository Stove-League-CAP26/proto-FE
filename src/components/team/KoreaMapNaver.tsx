// src/components/team/KoreaMapNaver.tsx
// 네이버 지도 API v3 — Marker + HTML icon 방식 (CustomOverlay 미사용)
//
// ★ 설정: .env 에 VITE_NAVER_CLIENT_ID=클라이언트ID 추가

import { useEffect, useRef, useState } from "react";
import { KBO_TEAMS, type Team } from "@/mock/teamData";

const STADIUM_COORDS: Record<string, { lat: number; lng: number }> = {
  kia: { lat: 35.168, lng: 126.8891 },
  samsung: { lat: 35.8412, lng: 128.6814 },
  lg: { lat: 37.5122, lng: 127.0719 },
  doosan: { lat: 37.5128, lng: 127.0724 },
  lotte: { lat: 35.1938, lng: 129.0611 },
  hanwha: { lat: 36.3172, lng: 127.4295 },
  ssg: { lat: 37.437, lng: 126.693 },
  kt: { lat: 37.299, lng: 127.0097 },
  nc: { lat: 35.2225, lng: 128.5826 },
  kiwoom: { lat: 37.4985, lng: 126.8672 },
};

interface KoreaMapNaverProps {
  onSelect: (team: Team) => void;
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
}

declare global {
  interface Window {
    naver: any;
  }
}

export default function KoreaMapNaver({
  onSelect,
  hoveredId,
  onHover,
}: KoreaMapNaverProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerMap = useRef<Map<string, any>>(new Map());

  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  const onSelectRef = useRef(onSelect);
  const onHoverRef = useRef(onHover);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);

  // ── 1. SDK 동적 로드 ─────────────────────────────────────────
  useEffect(() => {
    if (window.naver?.maps) {
      setSdkReady(true);
      return;
    }

    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID as string | undefined;
    if (!clientId) {
      console.error(
        "[KoreaMapNaver] VITE_NAVER_CLIENT_ID 환경변수가 없습니다.",
      );
      setSdkError(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.async = true;
    script.onload = () => {
      const poll = setInterval(() => {
        if (window.naver?.maps) {
          clearInterval(poll);
          setSdkReady(true);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(poll);
        if (!window.naver?.maps) setSdkError(true);
      }, 5000);
    };
    script.onerror = () => {
      setSdkError(true);
    };
    document.head.appendChild(script);
  }, []);

  // ── 2. 지도 + 마커 초기화 ────────────────────────────────────
  useEffect(() => {
    if (!sdkReady || !mapRef.current || mapInstance.current) return;

    const naver = window.naver.maps;

    const map = new naver.Map(mapRef.current, {
      center: new naver.LatLng(36.5, 127.8),
      zoom: 7,
      minZoom: 6,
      maxZoom: 13,
      mapTypeId: naver.MapTypeId.NORMAL,
      scaleControl: false,
      logoControl: false,
      mapDataControl: false,
      zoomControl: false,
    });
    mapInstance.current = map;

    KBO_TEAMS.forEach((team) => {
      const coord = STADIUM_COORDS[team.id];
      if (!coord) return;

      const marker = new naver.Marker({
        position: new naver.LatLng(coord.lat, coord.lng),
        map,
        icon: {
          content: buildMarkerHTML(team, false),
          anchor: new naver.Point(22, 22),
        },
        zIndex: 10,
      });

      markerMap.current.set(team.id, marker);

      naver.Event.addListener(marker, "click", () => onSelectRef.current(team));
      naver.Event.addListener(marker, "mouseover", () =>
        onHoverRef.current?.(team.id),
      );
      naver.Event.addListener(marker, "mouseout", () =>
        onHoverRef.current?.(null),
      );
    });

    return () => {
      markerMap.current.forEach((m) => m.setMap(null));
      markerMap.current.clear();
      mapInstance.current = null;
    };
  }, [sdkReady]);

  // ── 3. 외부 hoveredId → 마커 갱신 ───────────────────────────
  useEffect(() => {
    if (!sdkReady || !window.naver?.maps) return;
    const naver = window.naver.maps;

    KBO_TEAMS.forEach((team) => {
      const marker = markerMap.current.get(team.id);
      if (!marker) return;
      const isHov = hoveredId === team.id;
      marker.setIcon({
        content: buildMarkerHTML(team, isHov),
        anchor: new naver.Point(isHov ? 29 : 22, isHov ? 29 : 22),
      });
      marker.setZIndex(isHov ? 999 : 10);
    });
  }, [hoveredId, sdkReady]);

  if (sdkError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-blue-50 rounded-3xl border border-blue-100">
        <div className="text-center p-6">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="text-sm font-bold text-gray-700">
            네이버 지도를 불러올 수 없습니다
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            .env 파일의 VITE_NAVER_CLIENT_ID를 확인하세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full rounded-3xl overflow-hidden"
      style={{
        boxShadow:
          "0 8px 40px rgba(59,130,246,0.10), 0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div ref={mapRef} className="w-full h-full" />

      {!sdkReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl">
          <div className="text-center">
            <div className="w-9 h-9 border-2 border-blue-100 border-t-blue-400 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-600">
              지도 불러오는 중...
            </p>
          </div>
        </div>
      )}

      {sdkReady && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-gray-100">
          <p className="text-xs font-bold text-gray-600">
            ⚾ 구장 마커를 클릭해 팀 선택
          </p>
        </div>
      )}
    </div>
  );
}

// ── 마커 HTML ─────────────────────────────────────────────────
function buildMarkerHTML(team: Team, hovered: boolean): string {
  const size = hovered ? 58 : 44;
  const bg =
    team.colors.secondary === "#000000"
      ? `linear-gradient(135deg,${team.colors.primary},${team.colors.accent})`
      : `linear-gradient(135deg,${team.colors.primary},${team.colors.secondary})`;

  const tooltip = hovered
    ? `<div style="position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:${team.colors.primary};color:${team.colors.text};font-size:11px;font-weight:800;padding:5px 12px;border-radius:20px;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,0.22);pointer-events:none;font-family:-apple-system,sans-serif;">${team.name}<div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:${team.colors.primary};"></div></div>`
    : "";

  return `<div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">${tooltip}<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:${hovered ? `0 8px 28px ${team.colors.primary}88` : `0 2px 10px ${team.colors.primary}44`};cursor:pointer;font-size:${hovered ? 14 : 11}px;font-weight:900;color:${team.colors.text};font-family:-apple-system,sans-serif;user-select:none;">${team.shortName.slice(0, 2)}</div></div>`;
}
