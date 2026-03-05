"use client"

import React from "react"
import { Plus, Trash2, Key, RotateCcw, Settings, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { apiKeyManager } from "@/lib/api-key-manager"

export default function ApiKeyManagerUI() {
  const [keys, setKeys] = React.useState(apiKeyManager.getAllKeysStatus())
  const [config, setConfig] = React.useState(apiKeyManager.getConfig())
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [newKeyName, setNewKeyName] = React.useState("")
  const [newKeyValue, setNewKeyValue] = React.useState("")

  // Refresh data
  const refreshData = React.useCallback(() => {
    setKeys(apiKeyManager.getAllKeysStatus())
    setConfig(apiKeyManager.getConfig())
  }, [])

  // Auto-refresh every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [refreshData])

  const handleAddKey = () => {
    if (!newKeyName.trim() || !newKeyValue.trim()) {
      toast({
        title: "Error",
        description: "Please provide both name and API key",
        variant: "destructive",
      })
      return
    }

    try {
      apiKeyManager.addApiKey(newKeyValue.trim(), newKeyName.trim())
      setNewKeyName("")
      setNewKeyValue("")
      setAddDialogOpen(false)
      refreshData()
      toast({
        title: "Success",
        description: "API key added successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleRemoveKey = (key: string) => {
    if (keys.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot remove the last API key",
        variant: "destructive",
      })
      return
    }

    apiKeyManager.removeApiKey(key)
    refreshData()
    toast({
      title: "Success",
      description: "API key removed",
    })
  }

  const handleResetQuotas = () => {
    apiKeyManager.resetAllQuotas()
    refreshData()
    toast({
      title: "Success",
      description: "All quotas reset",
    })
  }

  const getKeyStatus = (key: any) => {
    const usagePercent = (key.quotaUsed / key.quotaLimit) * 100

    if (key.lastError) return { color: "destructive", text: "Error" }
    if (usagePercent >= 95) return { color: "destructive", text: "Exhausted" }
    if (usagePercent >= 80) return { color: "warning", text: "High Usage" }
    return { color: "success", text: "Active" }
  }

  const currentKey = keys[config.currentIndex]

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-sm">API Key Manager</CardTitle>
            <Badge variant={config.rotationEnabled ? "default" : "secondary"} className="text-xs">
              {config.rotationEnabled ? "Auto-Rotation ON" : "Manual"}
            </Badge>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Settings className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-950 border-neutral-800">
              <DialogHeader>
                <DialogTitle>API Key Settings</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Auto-Rotation</Label>
                  <Switch
                    checked={config.rotationEnabled}
                    onCheckedChange={(checked) => {
                      apiKeyManager.setRotationEnabled(checked)
                      refreshData()
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Auto-Failover</Label>
                  <Switch
                    checked={config.autoFailover}
                    onCheckedChange={(checked) => {
                      apiKeyManager.setAutoFailover(checked)
                      refreshData()
                    }}
                  />
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button onClick={handleResetQuotas} variant="outline" className="gap-2 bg-transparent">
                    <RotateCcw className="h-4 w-4" />
                    Reset All Quotas
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Active Key */}
        {currentKey && (
          <div className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Active: {currentKey.name}</span>
              </div>
              <Badge variant={getKeyStatus(currentKey).color as any} className="text-xs">
                {getKeyStatus(currentKey).text}
              </Badge>
            </div>
            <Progress value={(currentKey.quotaUsed / currentKey.quotaLimit) * 100} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>
                {currentKey.quotaUsed.toLocaleString()} / {currentKey.quotaLimit.toLocaleString()}
              </span>
              <span>{Math.round((currentKey.quotaUsed / currentKey.quotaLimit) * 100)}%</span>
            </div>
          </div>
        )}

        {/* All Keys List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">All Keys ({keys.length})</span>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-6 gap-1 text-xs bg-transparent">
                  <Plus className="h-3 w-3" />
                  Add Key
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-950 border-neutral-800">
                <DialogHeader>
                  <DialogTitle>Add YouTube API Key</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Primary Key, Backup Key"
                      className="bg-neutral-900 border-neutral-800"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="keyValue">API Key</Label>
                    <Input
                      id="keyValue"
                      type="password"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      placeholder="AIza..."
                      className="bg-neutral-900 border-neutral-800"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleAddKey} className="bg-[#1DB954] text-black hover:bg-[#19a94f]">
                      Add Key
                    </Button>
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {keys.map((key, index) => (
            <div
              key={key.key}
              className={`p-2 rounded border text-xs ${
                index === config.currentIndex
                  ? "border-green-500/50 bg-green-500/10"
                  : "border-neutral-700 bg-neutral-800/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium truncate">{key.name}</span>
                  {key.lastError && <AlertTriangle className="h-3 w-3 text-red-400 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={getKeyStatus(key).color as any} className="text-xs px-1 py-0">
                    {Math.round((key.quotaUsed / key.quotaLimit) * 100)}%
                  </Badge>
                  {keys.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-4 w-4 text-red-400 hover:text-red-300"
                      onClick={() => handleRemoveKey(key.key)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              {key.lastError && <div className="mt-1 text-xs text-red-400 truncate">Error: {key.lastError}</div>}
            </div>
          ))}
        </div>

        {keys.length === 0 && (
          <div className="text-center py-4 text-neutral-500 text-xs">
            No API keys configured. Add one to get started.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
