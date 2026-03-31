import { useQuery, useMutation } from 'convex/react'; 
import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { api } from '../convex/_generated/api';

import { MainLayout } from './components/layout/MainLayout';
import { OwnerLayout } from './components/layout/OwnerLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import { EmailVerificationPage } from './features/auth/EmailVerificationPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { LoginPage } from './features/auth/LoginPage';
import { OnboardingPage } from './features/auth/OnboardingPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { BoardingHouseDetails } from './features/boarding-house/BoardingHouseDetails';
import { Bookmarks } from './features/bookmarks/Bookmarks';
import { Dashboard as TenantDashboard } from './features/dashboard/Dashboard';
import { Inquiries as TenantInquiries } from './features/inquiries/Inquiries';
import { MapExplorer } from './features/map/MapExplorer';
import { OwnerInquiries } from './features/owner/inquiries/OwnerInquiries';
import { OwnerDashboard } from './features/owner/owner-dashboard/OwnerDashboard';
import { OwnerSettings } from './features/owner/owner-dashboard/OwnerSettings';
import { AddProperty } from './features/owner/properties/AddProperty';
import { DeletedProperties } from './features/owner/properties/DeletedProperties';
import { EditProperty } from './features/owner/properties/EditProperty';
import { MyProperties } from './features/owner/properties/MyProperties';
import { OwnerReviews } from './features/owner/reviews/OwnerReviews';
import { ProfileSettings } from './features/profile/ProfileSettings';
import { authClient } from './lib/auth-client';
import { UI_CONSTANTS } from './lib/constants';

function FullScreenLoading({ timedOut }: { timedOut?: boolean }) {
  if (timedOut) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground text-sm font-medium">Taking longer than expected...</p>
        <button
          onClick={() => { window.location.reload(); }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold"
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

/**
 * Prevents auth routing decisions until the session state has definitively settled.
 * On mount, waits a short grace period for the auth client to initialize
 * (e.g. detect OAuth tokens, restore cookies). After settling, tracks
 * loading state normally without re-introducing the grace period.
 */
function useAuthSettled(isSessionLoading: boolean) {
  const [settled, setSettled] = useState(false);
  const hasEverSettled = useRef(false);

  useEffect(() => {
    // Once we've settled once, never re-gate on mount delay
    if (hasEverSettled.current) {
      if (!isSessionLoading) setSettled(true);
      return;
    }

    // First mount: wait for auth client to finish initializing.
    // 150ms grace period covers the OAuth token detection window
    // without being perceptible to users.
    if (!isSessionLoading) {
      const timer = setTimeout(() => {
        hasEverSettled.current = true;
        setSettled(true);
      }, UI_CONSTANTS.AUTH_SETTLE_GRACE_MS);
      return () => clearTimeout(timer);
    }
    return;
  }, [isSessionLoading]);

  // If currently loading and we've already settled once, remain settled
  // (prevents the spinner from flashing during logout transitions)
  // eslint-disable-next-line react-hooks/refs -- Intentional: ref tracks settled state for return value, not for rendering
  return hasEverSettled.current || settled;
}

// --- Auth Guard Component ---
function AuthGuard({ children, requireRole }: { children: React.ReactNode, requireRole?: 'owner' | 'viewer' }) {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const profile = useQuery(api.users.getMyProfile);
  const syncProfile = useMutation(api.users.syncProfile);
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);
  const isAuthReady = useAuthSettled(isSessionLoading);

  useEffect(() => {
    const timer = setTimeout(() => { setTimedOut(true); }, UI_CONSTANTS.AUTH_SESSION_TIMEOUT_MS);
    return () => { clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (session?.user && profile && (profile.name !== session.user.name || profile.image !== session.user.image)) {
      const updates: { name?: string; image?: string } = {};
      if (session.user.name) updates.name = session.user.name;
      if (session.user.image) updates.image = session.user.image;
      void syncProfile(updates).catch(console.error);
    }
  }, [session?.user, profile, syncProfile]);

  if (!isAuthReady) return <FullScreenLoading timedOut={timedOut} />;
  if (!session) return <Navigate to="/" state={{ from: location }} replace />;
  if (profile === undefined) return <FullScreenLoading timedOut={timedOut} />;
  if (!profile) return <Navigate to="/" state={{ from: location }} replace />;

  if (!profile.onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (profile.onboardingComplete && location.pathname === '/onboarding') {
    return <Navigate to={profile.role === 'owner' ? '/owner' : '/tenant'} replace />;
  }

  if (requireRole && profile.role !== requireRole) {
    return <Navigate to={profile.role === 'owner' ? '/owner' : '/tenant'} replace />;
  }

  return <>{children}</>;
}

// --- Public Config (Redirects away if already logged in) ---
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const profile = useQuery(api.users.getMyProfile);
  const isAuthReady = useAuthSettled(isSessionLoading);

  if (!isAuthReady) return <FullScreenLoading />;
  if (!session) return <>{children}</>;
  if (profile === undefined) return <FullScreenLoading />;

  if (!profile) return <Navigate to="/" replace />;

  if (profile.onboardingComplete) {
    return <Navigate to={profile.role === 'owner' ? '/owner' : '/tenant'} replace />;
  }
  
  return <Navigate to="/onboarding" replace />;
}


export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<PublicOnly><LoginPage /></PublicOnly>} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
          <Route path="/reset-password" element={<PublicOnly><ResetPasswordPage /></PublicOnly>} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          
          {/* Onboarding Route (Must be logged in, but not necessarily onboarded) */}
          <Route path="/onboarding" element={
            <AuthGuard>
              <OnboardingPage />
            </AuthGuard>
          } />

          {/* Owner Routes (Requires 'owner' role) */}
          <Route path="/owner" element={
            <AuthGuard requireRole="owner">
              <OwnerLayout />
            </AuthGuard>
          }>
            <Route index element={<OwnerDashboard />} />
            <Route path="properties" element={<MyProperties />} />
            <Route path="properties/deleted" element={<DeletedProperties />} />
            <Route path="properties/add" element={<AddProperty />} />
            <Route path="properties/edit/:id" element={<EditProperty />} />
            <Route path="inquiries" element={<OwnerInquiries />} />
            <Route path="reviews" element={<OwnerReviews />} />
            <Route path="settings" element={<OwnerSettings />} />
          </Route>

          {/* Tenant Routes (Requires 'viewer' role) */}
          <Route path="/tenant" element={
            <AuthGuard requireRole="viewer">
              <MainLayout />
            </AuthGuard>
          }>
            <Route index element={<TenantDashboard />} />
            <Route path="map" element={<MapExplorer />}>
              <Route path="roomet/:id" element={<BoardingHouseDetails />} />
            </Route>

            <Route path="bookmarks" element={<Bookmarks />} />
            <Route path="inquiries" element={<TenantInquiries />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
