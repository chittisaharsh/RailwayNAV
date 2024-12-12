import { Button } from "@/components/ui/button";

export default function WelcomeScreen({ onPravasiPathClick }: { onPravasiPathClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-orange-500">
      <div
        className="w-[1850px] h-[760px] border-[10px] border-orange-500 rounded-lg p-8 flex flex-col items-center justify-center"
        style={{ maxWidth: "95%", margin: "auto" }}
      >
        <h1 className="text-8xl font-bold text-center text-white mb-12">
          Welcome Traveller!
        </h1>

        <div className="grid grid-cols-2 gap-8">
          {/* PravasiPath Section */}
          <div className="flex flex-col items-center space-y-4 ">
            <div className="w-[600px] h-80 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white">
              {/* Use PravasiPath SVG */}
              <img
                src="/pravasipath_logo.svg"
                alt="PravasiPath Logo"
                className="w-[500px] max-h-full object-contain"
              />
            </div>
            <Button
              className="w-full text-lg h-12 bg-black text-white hover:bg-gray-800"
              onClick={onPravasiPathClick}
            >
              PravasiPath
            </Button>
          </div>

          {/* IRCTC Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-[600px] h-80 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white">
              {/* Use IRCTC SVG */}
              <img
                src="/irctc_logo.svg"
                alt="IRCTC Logo"
                className="w-[150px] max-h-full object-contain"
              />
            </div>
            <Button
              className="w-full text-lg h-12 bg-black text-white hover:bg-gray-800"
              onClick={() => (window.location.href = "https://www.irctc.co.in/nget/train-search")}
            >
              IRCTC e-Ticketing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
