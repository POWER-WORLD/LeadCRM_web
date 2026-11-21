export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse mb-8"></div>

        {/* Filter skeleton */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* List skeleton */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50/70 rounded-xl animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-36"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
