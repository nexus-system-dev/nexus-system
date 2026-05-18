import { BrowserRouter, Routes, Route, Navigate } from 'react-router';

// Screens
import { HomeScreen } from './screens/HomeScreen';
import { CreateScreen } from './screens/CreateScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { UnderstandingScreen } from './screens/UnderstandingScreen';
import { LoopScreen } from './screens/LoopScreen';
import { ExecutionScreen } from './screens/ExecutionScreen';
import { ProofScreen } from './screens/ProofScreen';
import { ConfirmationScreen } from './screens/ConfirmationScreen';
import { StateUpdateScreen } from './screens/StateUpdateScreen';
import { NextTaskScreen } from './screens/NextTaskScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { FilesScreen } from './screens/FilesScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { IntegrationsScreen } from './screens/IntegrationsScreen';
import { HelpScreen } from './screens/HelpScreen';
import { AdvancedHubScreen } from './screens/AdvancedHubScreen';
import { DeveloperScreen } from './screens/DeveloperScreen';
import { BrainScreen } from './screens/BrainScreen';
import { ReleaseScreen } from './screens/ReleaseScreen';
import { GrowthScreen } from './screens/GrowthScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Primary Flow - The Core Product Loop */}
        <Route path="/" element={<Navigate to="/create" replace />} />
        <Route path="/create" element={<CreateScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/understanding" element={<UnderstandingScreen />} />
        <Route path="/loop" element={<LoopScreen />} />
        <Route path="/execution" element={<ExecutionScreen />} />
        <Route path="/proof" element={<ProofScreen />} />
        <Route path="/confirmation" element={<ConfirmationScreen />} />
        <Route path="/state-update" element={<StateUpdateScreen />} />
        <Route path="/next-task" element={<NextTaskScreen />} />
        <Route path="/timeline" element={<TimelineScreen />} />

        {/* Secondary Screens - Supporting Functions */}
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/files" element={<FilesScreen />} />
        <Route path="/notifications" element={<NotificationsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/integrations" element={<IntegrationsScreen />} />
        <Route path="/help" element={<HelpScreen />} />

        {/* Advanced Screens - Power User Tools */}
        <Route path="/advanced" element={<AdvancedHubScreen />} />
        <Route path="/developer" element={<DeveloperScreen />} />
        <Route path="/brain" element={<BrainScreen />} />
        <Route path="/release" element={<ReleaseScreen />} />
        <Route path="/growth" element={<GrowthScreen />} />

        {/* Catch all - redirect to create */}
        <Route path="*" element={<Navigate to="/create" replace />} />
      </Routes>
    </BrowserRouter>
  );
}