"use client"

import React from "react"
import { Activity, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { toast } from "@/hooks/use-toast"

type QuotaSettings = {
  alertThreshold: number // Percentage (0-100)
  enableAlerts: boolean
  enableNotifications: boolean
  dailyLimit: number // Expected daily quota limit
}

type QuotaUsage = {
  used: number
  limit: number
  resetTime: string
  lastUpdated: number
}

const defaultSettings: QuotaSettings = {
  alertThreshold: 80,
  enableAlerts: true,
  enableNotifications: true,
  dailyLimit: 1000000, // Default Deezer API quota (no strict limit)
}

export default function QuotaMonitor() {
  const [settings, setSettings] = useLocalStorage<QuotaSettings>("quota_settings", defaultSettings)
  const [usage, setUsage] = useLocalStorage<QuotaUsage | null>("quota_usage", null)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [tempSettings, setTempSettings] = React.useState(settings)

  // Calculate quota usage percentage
  const usagePercentage = usage ? Math.min((usage.used / usage.limit) * 100, 100) : 0
  const isNearLimit = usagePercentage >= settings.alertThreshold
  const isOverLimit = usagePercentage >= 95

  // Request notification permission
  React.useEffect(() => {
    if (settings.enableNotifications && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [settings.enableNotifications])

  // Check for quota alerts
  React.useEffect(() => {
    if (!usage || !settings.enableAlerts) return

    const shouldAlert = usagePercentage >= settings.alertThreshold
    const lastAlertKey = `quota_alert_${Math.floor(usagePercentage / 10) * 10}`
    const lastAlert = localStorage.getItem(lastAlertKey)
    const now = Date.now()

    // Only alert once per 10% threshold per hour
    if (shouldAlert && (!lastAlert || now - Number.parseInt(lastAlert) > 3600000)) {
      const message = `Deezer API quota at ${Math.round(usagePercentage)}%`

      // Toast notification
      toast({
        title: "Quota Alert",
        description: message,
        variant: isOverLimit ? "destructive" : "default",
      })

      // Browser notification
      if (settings.enableNotifications && Notification.permission === "granted") {
        new Notification("Greenify - Quota Alert", {
          body: message,
          icon: "/favicon.ico",
          tag: "quota-alert",
        })
      }

      localStorage.setItem(lastAlertKey, now.toString())
    }
  }, [usage, settings, usagePercentage, isOverLimit])

  // Fetch current quota usage
  const fetchQuotaUsage = async () => {
    try {
      const response = await fetch("/api/quota-status")
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error("Failed to fetch quota usage:", error)
    }
  }

  // Auto-refresh quota usage every 5 minutes
  React.useEffect(() => {
    fetchQuotaUsage()
    const interval = setInterval(fetchQuotaUsage, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const saveSettings = () => {
    setSettings(tempSettings)
    setSettingsOpen(false)
    toast({
      title: "Settings saved",
      description: "Quota alert settings have been updated.",
    })
  }

  const getStatusColor = () => {
    if (isOverLimit) return "destructive"
    if (isNearLimit) return "warning"
    return "default"
  }

  const getStatusText = () => {
    if (isOverLimit) return "Critical"
    if (isNearLimit) return "Warning"
    return "Normal"
  }

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-sm">Deezer API Status</CardTitle>
            <Badge variant={getStatusColor() as any} className="text-xs">
              {getStatusText()}
            </Badge>
          </div>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Settings className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-950 border-neutral-800">
              <DialogHeader>
                <DialogTitle>Quota Alert Settings</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="threshold">Alert Threshold (%)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="1"
                    max="100"
                    value={tempSettings.alertThreshold}
                    onChange={(e) =>
                      setTempSettings({ ...tempSettings, alertThreshold: Number.parseInt(e.target.value) || 80 })
                    }
                    className="bg-neutral-900 border-neutral-800"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dailyLimit">Daily Quota Limit</Label>
                  <Input
                    id="dailyLimit"
                    type="number"
                    min="100000"
                    value={tempSettings.dailyLimit}
                    onChange={(e) =>
                      setTempSettings({ ...tempSettings, dailyLimit: Number.parseInt(e.target.value) || 1000000 })
                    }
                    className="bg-neutral-900 border-neutral-800"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableAlerts">Enable Toast Alerts</Label>
                  <Switch
                    id="enableAlerts"
                    checked={tempSettings.enableAlerts}
                    onCheckedChange={(checked) => setTempSettings({ ...tempSettings, enableAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableNotifications">Enable Browser Notifications</Label>
                  <Switch
                    id="enableNotifications"
                    checked={tempSettings.enableNotifications}
                    onCheckedChange={(checked) => setTempSettings({ ...tempSettings, enableNotifications: checked })}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={saveSettings} className="bg-[#1DB954] text-black hover:bg-[#19a94f]">
                    Save Settings
                  </Button>
                  <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {usage ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>Used: {usage.used.toLocaleString()}</span>
              <span>Limit: {usage.limit.toLocaleString()}</span>
            </div>
            <Progress
              value={usagePercentage}
              className="h-2"
              // @ts-ignore - Custom progress colors
              style={
                {
                  "--progress-background": isOverLimit ? "#dc2626" : isNearLimit ? "#f59e0b" : "#10b981",
                } as any
              }
            />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>{Math.round(usagePercentage)}% used</span>
              <span>Resets: {new Date(Date.now() + 3600000).toLocaleTimeString()}</span>{" "}
              {/* Updated reset time logic */}
            </div>
          </div>
        ) : (
          <div className="text-xs text-neutral-500">Loading quota status...</div>
        )}
      </CardContent>
    </Card>
  )
}
