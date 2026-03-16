'use client';

import React from 'react';
import { SessionProvider } from '@jazzmind/busibox-app/components/auth/SessionProvider';
import { ThemeProvider, CustomizationProvider } from '@jazzmind/busibox-app';
import { FetchWrapper } from '@jazzmind/busibox-app';
import { VersionBar } from '@jazzmind/busibox-app';

interface ProvidersProps {
  children: React.ReactNode;
  appId: string;
  portalUrl: string;
  basePath: string;
  portalBasePath: string;
  checkIntervalMs?: number;
  refreshBufferMs?: number;
  tokenExpiresOverrideMs?: number;
}

export default function Providers({
  children,
  appId,
  portalUrl,
  basePath,
  portalBasePath,
  checkIntervalMs,
  refreshBufferMs,
  tokenExpiresOverrideMs,
}: ProvidersProps) {
  return (
    <>
      <FetchWrapper skipAuthUrls={['/api/auth/session', '/api/logout', '/api/health']} />
      <ThemeProvider>
        <SessionProvider
          appId={appId}
          portalUrl={portalUrl}
          basePath={basePath}
          checkIntervalMs={checkIntervalMs}
          refreshBufferMs={refreshBufferMs}
          tokenExpiresOverrideMs={tokenExpiresOverrideMs}
        >
          <CustomizationProvider apiEndpoint={`${portalBasePath}/api/portal-customization`}>
            {children}
            <VersionBar />
          </CustomizationProvider>
        </SessionProvider>
      </ThemeProvider>
    </>
  );
}
