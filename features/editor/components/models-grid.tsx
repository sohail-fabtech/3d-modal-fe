"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GeneratedModel {
  id: string
  modelUrl: string
  downloadUrl: string
  prompt: string
  timestamp: number
}

interface ModelsGridProps {
  models: GeneratedModel[]
  onSelectModel: (model: GeneratedModel) => void
  onDeleteModel: (id: string) => void
}

export default function ModelsGrid({ models, onSelectModel, onDeleteModel }: ModelsGridProps) {
  if (models.length === 0) {
    return null
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-8 pb-4 px-4 pointer-events-auto max-h-[30vh] overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <p className="text-gray-400 text-sm mb-4 tracking-normal">Generated Models</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {models.map((model) => (
            <div
              key={model.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-900/50 border border-gray-700/50 hover:border-gray-500 transition-all"
              onClick={() => onSelectModel(model)}
            >
              {/* Placeholder thumbnail */}
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center px-2">
                  <p className="text-xs text-gray-400 line-clamp-2">{model.prompt || "Generated Model"}</p>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  className="bg-white hover:bg-gray-200 text-black rounded-full px-3 py-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectModel(model)
                  }}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-full px-3 py-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteModel(model.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {/* Timestamp */}
              <div className="absolute top-1 right-1 bg-black/70 px-2 py-1 rounded text-xs text-gray-400">
                {new Date(model.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
