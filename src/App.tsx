import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { authClient } from './lib/auth-client';

// Layouts & Pages
import { MainLayout } from './components/layout/MainLayout';
import { MapExplorer } from './features/map/MapExplorer';
import { BoardingHouseDetails } from './features/boarding-house/BoardingHouseDetails';
import { Dashboard as TenantDashboard } from './features/dashboard/Dashboard';
import { Bookmarks } from './features/bookmarks/Bookmarks';
import { Inquiries as TenantInquiries } from './features/inquiries/Inquiries';
import { ProfileSettings } from './features/profile/ProfileSettings';
import { ThemeProvider } from './contexts/ThemeContext';

import { OwnerLayout } from './components/layout/OwnerLayout';
import { OwnerDashboard } from './features/owner/owner-dashboard/OwnerDashboard';
import { OwnerSettings } from './features/owner/owner-dashboard/OwnerSettings';
import { MyProperties } from './features/owner/properties/MyProperties';
import { AddProperty } from './features/owner/properties/AddProperty';
import { EditProperty } from './features/owner/properties/EditProperty';
import { OwnerInquiries } from './features/owner/inquiries/OwnerInquiries';
import { OwnerReviews } from './features/owner/reviews/OwnerReviews';

// Auth Pages
import { LoginPage } from './features/auth/LoginPage';
import { OnboardingPage } from './features/auth/OnboardingPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { EmailVerificationPage } from './features/auth/EmailVerificationPage';

// --- Auth Guard Component ---
function AuthGuard({ children, requireRole }: { children: React.ReactNode, requireRole?: 'owner' | 'viewer' }) {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const profile = useQuery(api.users.getMyProfile);
  const syncProfile = useMutation(api.users.syncProfile);
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  // RES-H03: Timeout for loading states to prevent infinite spinner
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 15_000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (session?.user && profile && (profile.name !== session?.user.name || profile.image !== session?.user.image)) {
      syncProfile({ name: session.user.name, image: session.user.image || undefined }).catch(console.error);
    }
    // RES-M01: Narrow deps to specific fields that are compared
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.name, session?.user?.image, profile?.name, profile?.image]);

  // 1. Wait for better-auth session to load first
  if (isSessionLoading) {
    if (timedOut) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
          <p className="text-muted-foreground text-sm font-medium">Taking longer than expected...</p>
          <button
            onClick={() => window.location.reload()}
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

  // 2. Not logged in -> redirect to login immediately
  if (!session) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 3. User is logged in, now wait for Convex profile data
  // Profile is undefined while loading, null if user has no profile yet
  if (profile === undefined) {
    if (timedOut) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
          <p className="text-muted-foreground text-sm font-medium">Taking longer than expected...</p>
          <button
            onClick={() => window.location.reload()}
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

  // 4. Logged in but not onboarded -> redirect to onboarding (unless already there)
  if (!profile?.onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // 4b. Already onboarded but still on /onboarding -> redirect to dashboard
  if (profile?.onboardingComplete && location.pathname === '/onboarding') {
    return <Navigate to={profile.role === 'owner' ? '/owner' : '/tenant'} replace />;
  }

  // 5. Role mismatch check (if a specific role is required for this route)
  if (requireRole && profile && profile.role !== requireRole) {
    // Redirect to their proper home based on their actual role
    return <Navigate to={profile.role === 'owner' ? '/owner' : '/tenant'} replace />;
  }

  // 6. Authorized
  return <>{children}</>;
}

// --- Public Config (Redirects away if already logged in) ---
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const profile = useQuery(api.users.getMyProfile);

  // 1. Wait for session to load
  if (isSessionLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // 2. Not logged in -> render public content (Login page)
  if (!session) {
    return <>{children}</>;
  }

  // 3. Logged in -> wait for Convex profile data
  if (profile === undefined) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // 4. If logged in and onboarded, go to respective dashboard
  if (profile?.onboardingComplete) {
    return <Navigate to={profile.role === 'owner' ? '/owner' : '/tenant'} replace />;
  }
  
  // 5. If logged in but not onboarded, go to onboarding
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
