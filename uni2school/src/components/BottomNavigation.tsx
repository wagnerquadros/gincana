import { Users, BookOpen, Trophy, User, AlertTriangle } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  reviewCount?: number;
}

export default function BottomNavigation({ activeTab, onTabChange, reviewCount = 0 }: BottomNavigationProps) {
  const tabs = [
    {
      id: 'team',
      label: 'Equipe',
      icon: Users,
      color: 'text-blue-600',
      activeColor: 'bg-blue-50'
    },
    {
      id: 'provas',
      label: 'Provas',
      icon: BookOpen,
      color: 'text-green-600',
      activeColor: 'bg-green-50'
    },
    {
      id: 'ranking',
      label: 'Ranking',
      icon: Trophy,
      color: 'text-yellow-600',
      activeColor: 'bg-yellow-50'
    },
    {
      id: 'reviews',
      label: 'Revisões',
      icon: AlertTriangle,
      color: 'text-orange-600',
      activeColor: 'bg-orange-50',
      badge: reviewCount > 0 ? reviewCount : undefined
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      color: 'text-purple-600',
      activeColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden shadow-lg">
      <div className="flex items-center justify-around py-3 px-1 pb-safe-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`mobile-nav-item ${
                isActive ? 'mobile-nav-item-active' : 'mobile-nav-item-inactive'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`mobile-nav-icon ${
                    isActive ? 'mobile-nav-icon-active' : 'mobile-nav-icon-inactive'
                  }`} 
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span 
                className={`mobile-nav-label ${
                  isActive ? 'mobile-nav-label-active' : 'mobile-nav-label-inactive'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
