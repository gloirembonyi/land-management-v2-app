"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, File, FileText, ImageIcon, X, CheckCircle, AlertCircle } from "lucide-react"
import { useNotifications } from "@/components/notifications/notification-provider"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "completed" | "error"
  progress: number
  url?: string
}

interface DocumentUploadProps {
  onFilesUploaded?: (files: UploadedFile[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
}

export function DocumentUpload({
  onFilesUploaded,
  maxFiles = 5,
  acceptedTypes = ["image/*", "application/pdf", ".doc", ".docx"],
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const { showNotification } = useNotifications()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    handleFiles(selectedFiles)
  }, [])

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      if (files.length + newFiles.length > maxFiles) {
        showNotification(`Maximum ${maxFiles} files allowed`, "error")
        return
      }

      const uploadFiles: UploadedFile[] = newFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
        progress: 0,
      }))

      setFiles((prev) => [...prev, ...uploadFiles])

      // Simulate file upload
      uploadFiles.forEach((file) => {
        simulateUpload(file.id)
      })

      showNotification(`Uploading ${newFiles.length} file(s)`, "info")
    },
    [files.length, maxFiles, showNotification],
  )

  const simulateUpload = useCallback(
    (fileId: string) => {
      const interval = setInterval(() => {
        setFiles((prev) =>
          prev.map((file) => {
            if (file.id === fileId) {
              const newProgress = Math.min(file.progress + Math.random() * 30, 100)
              const isCompleted = newProgress >= 100

              if (isCompleted) {
                clearInterval(interval)
                showNotification(`${file.name} uploaded successfully`, "success")
                return {
                  ...file,
                  progress: 100,
                  status: "completed",
                  url: `/uploads/${file.name}`,
                }
              }

              return { ...file, progress: newProgress }
            }
            return file
          }),
        )
      }, 200)
    },
    [showNotification],
  )

  const removeFile = useCallback(
    (fileId: string) => {
      setFiles((prev) => prev.filter((file) => file.id !== fileId))
      showNotification("File removed", "info")
    },
    [showNotification],
  )

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />
    if (type === "application/pdf") return <FileText className="w-5 h-5 text-red-500" />
    return <File className="w-5 h-5 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-[#c6ecc5] shadow-lg">
      <CardHeader>
        <CardTitle className="text-[#17412b] flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Document Upload
        </CardTitle>
        <CardDescription>Upload land documents, certificates, and supporting files</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragging
              ? "border-[#69d259] bg-[#c6ecc5]/20"
              : "border-[#c6ecc5] hover:border-[#69d259] hover:bg-[#f2faf4]"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-[#69d259]" : "text-gray-400"}`} />
          <p className="text-lg font-medium text-[#17412b] mb-2">
            {isDragging ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-sm text-gray-600 mb-4">or click to browse files</p>
          <input
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button
            asChild
            className="bg-gradient-to-r from-[#17412b] to-[#69d259] hover:from-[#69d259] hover:to-[#17412b] text-white"
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              Select Files
            </label>
          </Button>
          <p className="text-xs text-gray-500 mt-2">Max {maxFiles} files • PDF, DOC, DOCX, Images</p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-[#17412b]">Uploaded Files ({files.length})</h4>
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#f2faf4] to-[#e5eee9] rounded-lg border border-[#c6ecc5]"
              >
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#17412b] truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  {file.status === "uploading" && <Progress value={file.progress} className="mt-1 h-1" />}
                </div>
                <div className="flex items-center space-x-2">
                  {file.status === "completed" && (
                    <Badge className="bg-[#69d259] hover:bg-[#69d259]">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Uploaded
                    </Badge>
                  )}
                  {file.status === "error" && (
                    <Badge variant="destructive">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Error
                    </Badge>
                  )}
                  {file.status === "uploading" && <Badge variant="secondary">Uploading...</Badge>}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-red-100"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
