"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, MapPin, FileText, CheckCircle, AlertCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/types"

interface LandRegistrationViewProps {
  user: User
  onBack: () => void
}

interface DocumentUpload {
  id: string
  file: File
  type: string
  preview?: string
}

const DOCUMENT_TYPES = [
  { value: "title_deed", label: "Title Deed", required: true },
  { value: "survey_map", label: "Survey Map", required: true },
  { value: "tax_certificate", label: "Tax Certificate", required: true },
  { value: "identity_document", label: "Identity Document", required: true },
  { value: "other", label: "Other Documents", required: false },
]

export function LandRegistrationView({ user, onBack }: LandRegistrationViewProps) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location_address: "",
    latitude: "",
    longitude: "",
    area_size: "",
    price: "",
  })

  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newDocument: DocumentUpload = {
        id,
        file,
        type: documentType,
      }

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setDocuments((prev) =>
            prev.map((doc) => (doc.id === id ? { ...doc, preview: e.target?.result as string } : doc)),
          )
        }
        reader.readAsDataURL(file)
      }

      setDocuments((prev) => [...prev, newDocument])
    })
  }

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
          setFormData((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }))
          toast({
            title: "Location captured",
            description: "GPS coordinates have been added to your land registration.",
          })
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to get your current location. Please enter coordinates manually.",
            variant: "destructive",
          })
        },
      )
    }
  }

  const validateStep1 = () => {
    return formData.title && formData.location_address && formData.area_size
  }

  const validateStep2 = () => {
    const requiredDocs = DOCUMENT_TYPES.filter((type) => type.required)
    return requiredDocs.every((reqDoc) => documents.some((doc) => doc.type === reqDoc.value))
  }

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) {
      toast({
        title: "Incomplete information",
        description: "Please fill all required fields and upload required documents.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // First, upload documents
      const uploadedDocuments = []

      for (const doc of documents) {
        const formData = new FormData()
        formData.append("file", doc.file)
        formData.append("document_type", doc.type)

        const uploadResponse = await fetch("/api/upload-document", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload document")
        }

        const uploadResult = await uploadResponse.json()
        uploadedDocuments.push({
          document_type: doc.type,
          file_name: doc.file.name,
          file_url: uploadResult.url,
          file_size: doc.file.size,
          mime_type: doc.file.type,
        })
      }

      // Then create the land registration
      const registrationData = {
        ...formData,
        userId: user.id,
        area_size: Number.parseFloat(formData.area_size),
        price: formData.price ? Number.parseFloat(formData.price) : null,
        latitude: formData.latitude ? Number.parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? Number.parseFloat(formData.longitude) : null,
        documents: uploadedDocuments,
      }

      const response = await fetch("/api/lands/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to register land")
      }

      toast({
        title: "Registration submitted!",
        description: "Your land registration has been submitted for admin approval.",
      })

      // Reset form and go back
      setFormData({
        title: "",
        description: "",
        location_address: "",
        latitude: "",
        longitude: "",
        area_size: "",
        price: "",
      })
      setDocuments([])
      setStep(1)
      onBack()
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description:
          error instanceof Error ? error.message : "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Land Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="Enter land title"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe your land (optional)"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="location">Location Address *</Label>
        <Input
          id="location"
          value={formData.location_address}
          onChange={(e) => handleInputChange("location_address", e.target.value)}
          placeholder="Enter full address"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            value={formData.latitude}
            onChange={(e) => handleInputChange("latitude", e.target.value)}
            placeholder="0.000000"
            type="number"
            step="any"
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            value={formData.longitude}
            onChange={(e) => handleInputChange("longitude", e.target.value)}
            placeholder="0.000000"
            type="number"
            step="any"
          />
        </div>
      </div>

      <Button onClick={getCurrentLocation} variant="outline" className="w-full bg-transparent">
        <MapPin className="w-4 h-4 mr-2" />
        Use Current Location
      </Button>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="area">Area Size (m²) *</Label>
          <Input
            id="area"
            value={formData.area_size}
            onChange={(e) => handleInputChange("area_size", e.target.value)}
            placeholder="1000"
            type="number"
            step="0.01"
          />
        </div>
        <div>
          <Label htmlFor="price">Price (RWF)</Label>
          <Input
            id="price"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="1000000"
            type="number"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Please upload all required documents. Accepted formats: PDF, JPG, PNG (max 10MB each)
      </div>

      {DOCUMENT_TYPES.map((docType) => (
        <Card key={docType.value} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="font-medium">{docType.label}</span>
              {docType.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {documents
              .filter((doc) => doc.type === docType.value)
              .map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{doc.file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(doc.file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeDocument(doc.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <input
                type="file"
                id={`file-${docType.value}`}
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, docType.value)}
                className="hidden"
              />
              <label htmlFor={`file-${docType.value}`} className="flex flex-col items-center gap-2 cursor-pointer">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload {docType.label.toLowerCase()}</span>
              </label>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Review Your Registration</h3>
        <p className="text-muted-foreground">Please review all information before submitting for admin approval.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Land Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>Title:</strong> {formData.title}
          </div>
          <div>
            <strong>Location:</strong> {formData.location_address}
          </div>
          <div>
            <strong>Area:</strong> {formData.area_size} m²
          </div>
          {formData.price && (
            <div>
              <strong>Price:</strong> {Number.parseInt(formData.price).toLocaleString()} RWF
            </div>
          )}
          {formData.description && (
            <div>
              <strong>Description:</strong> {formData.description}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">
                  {DOCUMENT_TYPES.find((t) => t.value === doc.type)?.label}: {doc.file.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">What happens next?</p>
            <p className="text-blue-700 mt-1">
              Your registration will be reviewed by our admin team. You'll receive a notification once it's approved,
              and your land will be added to your portfolio with blockchain verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-green-700">
            ←
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Register New Land</h1>
            <p className="text-green-100 text-sm">Step {step} of 3</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 h-1">
        <div className="bg-green-600 h-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isSubmitting}>
              Previous
            </Button>
          )}

          {step < 3 ? (
            <Button
              className="flex-1"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !validateStep1() : step === 2 ? !validateStep2() : false}
            >
              Next
            </Button>
          ) : (
            <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Registration"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
