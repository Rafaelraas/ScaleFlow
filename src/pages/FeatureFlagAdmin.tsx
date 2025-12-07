/**
 * Feature Flag Admin Panel
 *
 * Displays all feature flags and their configuration.
 * Accessible only to system administrators.
 */

import { getFeatureFlagConfig } from '@/lib/feature-flags';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FeatureFlagAdmin() {
  const flags = getFeatureFlagConfig();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Feature Flags</h1>
        <p className="text-muted-foreground mt-2">
          View and monitor feature flag configurations across the application.
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(flags).map(([name, config]) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg font-mono">{name}</span>
                <Badge variant={config.enabled ? 'default' : 'secondary'}>
                  {config.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{config.description}</p>

              <div className="space-y-2 text-sm">
                {config.rolloutPercentage !== undefined && (
                  <div className="flex items-center gap-2">
                    <strong className="text-foreground">Rollout:</strong>
                    <span className="text-muted-foreground">{config.rolloutPercentage}%</span>
                  </div>
                )}
                {config.environments && (
                  <div className="flex items-center gap-2">
                    <strong className="text-foreground">Environments:</strong>
                    <div className="flex gap-1">
                      {config.environments.map((env) => (
                        <Badge key={env} variant="outline" className="text-xs">
                          {env}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {config.roles && (
                  <div className="flex items-center gap-2">
                    <strong className="text-foreground">Roles:</strong>
                    <div className="flex gap-1">
                      {config.roles.map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default FeatureFlagAdmin;
