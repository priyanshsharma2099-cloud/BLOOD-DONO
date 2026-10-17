import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { RoleSwitcherModal } from './components/common/RoleSwitcherModal';
import { SystemReadinessModal } from './components/common/SystemReadinessModal';

// Home Views
import { HeroSection } from './components/home/HeroSection';
import { FeatureCards } from './components/home/FeatureCards';
import { RealMetricsSection } from './components/home/RealMetricsSection';
import { BloodCompatibilityGuide } from './components/home/BloodCompatibilityGuide';

// Feature Views
import { FindBloodWizard } from './components/wizard/FindBloodWizard';
import { RequestTracker } from './components/tracker/RequestTracker';
import { DonorHub } from './components/donor/DonorHub';
import { FacilityDirectory } from './components/facilities/FacilityDirectory';
import { FacilityPortal } from './components/facilities/FacilityPortal';
import { BloodCamps } from './components/camps/BloodCamps';
import { AdminPortal } from './components/admin/AdminPortal';

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <div>
            <HeroSection />
            <FeatureCards />
            <RealMetricsSection />
            <BloodCompatibilityGuide />
          </div>
        )}

        {currentView === 'find-blood' && <FindBloodWizard />}
        {currentView === 'tracker' && <RequestTracker />}
        {currentView === 'donor-hub' && <DonorHub />}
        {currentView === 'facilities' && <FacilityDirectory />}
        {currentView === 'facility-portal' && <FacilityPortal />}
        {currentView === 'camps' && <BloodCamps />}
        {currentView === 'admin-portal' && <AdminPortal />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Slide-over Notification Panel */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Role / Persona Switcher Modal for Testing */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      {/* System Status & Diagnostics Modal */}
      <SystemReadinessModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
