export default function MenuEditorLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div>
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="w-28 h-9 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-4">
              <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
