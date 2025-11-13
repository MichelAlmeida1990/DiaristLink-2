"use client"

import dynamic from "next/dynamic"

const DiaristMapPage = dynamic(() => import("./page-content"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Carregando mapa...</p>
      </div>
    </div>
  ),
})

export default DiaristMapPage

