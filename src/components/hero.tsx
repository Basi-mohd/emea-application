import Link from "next/link";
import { ArrowUpRight, Check, BookOpen } from "lucide-react";

export default function Hero() {
  // This would typically come from a database or CMS
  const admissionStatus = "Closed"; // Can be "Open" or "Closed"

  return (
    <div className="relative overflow-hidden bg-white h-screen flex justify-center items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 opacity-70" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              EMEA HSS{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                Kondotty
              </span>
            </h1>
            <p className="text-gray-600 mb-8">
            PLUS ONE ADMISSION 2025-26(COMMUNITY QUOTA)
            </p>
            <div className="mb-8 flex justify-center">
              <div
                className={`px-4 py-2 rounded-full ${admissionStatus === "Open" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} font-medium text-sm inline-flex items-center`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${admissionStatus === "Open" ? "bg-green-500" : "bg-red-500"}`}
                ></span>
                Admission Status: {admissionStatus}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {admissionStatus === "Open" ? (
                <Link
                  href="/apply"
                  className="inline-flex items-center px-8 py-4 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
                >
                  Apply Now
                  <ArrowUpRight className="ml-2 w-5 h-5" />
                </Link>
              ) : null}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
