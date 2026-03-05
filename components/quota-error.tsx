"use client"

import { AlertTriangle, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function QuotaError({ onRetry }: { onRetry?: () => void }) {
  return (
    <Alert className="border-yellow-800 bg-yellow-950/20">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertTitle className="text-yellow-200">YouTube API Quota Exceeded</AlertTitle>
      <AlertDescription className="text-yellow-300/90 space-y-3">
        <p>The YouTube API daily quota has been reached. This resets at midnight Pacific Time.</p>

        <div className="space-y-2">
          <p className="font-medium">Solutions:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Wait until tomorrow (quota resets daily)</li>
            <li>Create a new YouTube API key in Google Cloud Console</li>
            <li>Request quota increase from Google</li>
          </ul>
        </div>

        <div className="flex gap-2 pt-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Google Cloud Console
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
