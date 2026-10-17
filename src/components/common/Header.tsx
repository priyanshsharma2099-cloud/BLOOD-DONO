import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { 
  Heart, 
  Bell, 
  Mail,
  Menu, 
  X, 
  Globe, 
  ShieldCheck, 
  Building2, 
  UserCircle 
} from 'lucide-react';
import { Language } from '../../data/translations';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenRoleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications, onOpenRoleModal }) => {
  const { 
    currentView, 
    setCurrentView, 
    language, 
    setLanguage, 
    t, 
    currentRole, 
    unreadNotificationsCount, 
    startNewBloodRequest,
    setIsEmailLogModalOpen
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navItems: { label: string; view: AppView }[] = [
    { label: 'Nearest Blood Map', view: 'nearest-map' },
    { label: t('facilitiesDirectory'), view: 'facilities' },
    { label: t('camps'), view: 'camps' },
    { label: t('donorHub'), view: 'donor-hub' },
    { label: t('requestTracker'), view: 'tracker' },
  ];

  // Additional role-based navigation tabs
  if (currentRole === 'hospital_staff' || currentRole === 'blood_bank_staff') {
    navItems.push({ label: t('facilityPortal'), view: 'facility-portal' });
  } else if (currentRole === 'admin') {
    navItems.push({ label: t('adminPortal'), view: 'admin-portal' });
  }

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const roleLabels: Record<string, string> = {
    requester: 'Requester',
    donor: 'Donor',
    hospital_staff: 'Hospital Staff',
    blood_bank_staff: 'Blood Bank',
    admin: 'Administrator',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 md:gap-8">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-md"
              aria-label="LifeLink AI Homepage"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
                LifeLink<span className="text-rose-600 font-extrabold">AI</span>
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`py-1 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 border-b-2 text-sm ${
                  currentView === item.view
                    ? 'border-rose-600 text-rose-600 font-semibold'
                    : 'border-transparent'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold"
                aria-label="Change Language"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="uppercase">{language}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  {(['en', 'es', 'hi', 'fr'] as Language[]).map((lng) => (
                    <button
                      key={lng}
                      onClick={() => {
                        setLanguage(lng);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 flex items-center justify-between ${
                        language === lng ? 'font-bold text-rose-600 bg-rose-50' : 'text-slate-700'
                      }`}
                    >
                      <span>
                        {lng === 'en' && 'English'}
                        {lng === 'es' && 'Español'}
                        {lng === 'hi' && 'हिन्दी'}
                        {lng === 'fr' && 'Français'}
                      </span>
                      <span className="uppercase text-slate-400 font-mono text-[10px]">{lng}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Email Alerts Trigger */}
            <button
              onClick={() => setIsEmailLogModalOpen(true)}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Open Email Notification Log"
              title="Automated Email & Gmail Dispatch Log"
            >
              <Mail className="w-5 h-5 text-rose-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white" />
            </button>

            {/* Notifications Trigger */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Open Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Role Switcher Pill */}
            <button
              onClick={onOpenRoleModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Click to switch role for testing"
            >
              <UserCircle className="w-3.5 h-3.5 text-slate-500" />
              <span className="whitespace-nowrap">{roleLabels[currentRole]}</span>
            </button>

            {/* Primary Action Button: FIND BLOOD NOW */}
            {currentView !== 'find-blood' && (
              <button
                onClick={startNewBloodRequest}
                className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 tracking-wide"
              >
                {t('findBloodNow')}
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Navigation
            </span>
            <button
              onClick={onOpenRoleModal}
              className="flex items-center gap-1 text-xs text-rose-600 font-semibold"
            >
              <UserCircle className="w-3.5 h-3.5" />
              Role: {roleLabels[currentRole]}
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg ${
                currentView === 'home' ? 'bg-rose-50 text-rose-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Homepage
            </button>
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg ${
                  currentView === item.view ? 'bg-rose-50 text-rose-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsEmailLogModalOpen(true);
              }}
              className="w-full text-left px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Email & Gmail Alerts Log</span>
              <Mail className="w-4 h-4 text-rose-600" />
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                startNewBloodRequest();
              }}
              className="w-full py-2.5 text-center text-sm font-bold text-white bg-rose-600 rounded-lg shadow"
            >
              {t('findBloodNow')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
