// 선수 프로필 페이지의 바로가기 버튼 모음 (타자/투수별 다른 앱 링크 표시)

interface PlayerAppLinksProps {
  apps: string[];
}

export default function PlayerAppLinks({ apps }: PlayerAppLinksProps) {
  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-gray-400 mr-1">바로가기</span>
        {apps.map((app) => (
          <button
            key={app}
            className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-sm"
          >
            {app}
          </button>
        ))}
      </div>
    </div>
  );
}
