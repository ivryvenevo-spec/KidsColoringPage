import { createRoot } from "react-dom/client";
import { useState, useRef, useEffect, ChangeEvent } from "react";
import { GoogleGenAI, Modality } from "@google/genai";

const App = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string | null>(null);
  const [coloringPage, setColoringPage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetState(false); // Reset state without clearing the file input
      setOriginalMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateColoringPage = async () => {
    if (!originalImage || !originalMimeType) return;

    setIsLoading(true);
    setError(null);
    setColoringPage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = originalImage.split(',')[1];

      const imagePart = {
        inlineData: { data: base64Data, mimeType: originalMimeType },
      };
      const textPart = {
        text: "Turn this image into a simple black and white coloring book page for a child. Remove all colors, shadows, and gradients. The lines should be clean, bold, and distinct. The final output should be a pure black and white line drawing.",
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
      });
      
      const imageResponsePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);

      if (imageResponsePart?.inlineData) {
        const generatedBase64 = imageResponsePart.inlineData.data;
        const mimeType = imageResponsePart.inlineData.mimeType || 'image/png';
        setColoringPage(`data:${mimeType};base64,${generatedBase64}`);
      } else {
        throw new Error("No image was returned from the API. Try a different image.");
      }
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't convert this image. Please try again or select a different photo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (originalImage && !coloringPage && !isLoading && !error) {
      generateColoringPage();
    }
  }, [originalImage]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setIsPreviewOpen(false);
        }
    };

    if (isPreviewOpen) {
        window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPreviewOpen]);

  const resetState = (clearInput = true) => {
    setOriginalImage(null);
    setOriginalMimeType(null);
    setColoringPage(null);
    setIsLoading(false);
    setError(null);
    setIsPreviewOpen(false);
    if (clearInput && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const LandingPage = () => (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
      <div className="@container">
        <div className="@[480px]:p-4">
          <div
            className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-lg items-center justify-center p-4"
            style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAIWwtm5ghSQy82xeW2ePCrbNL2l2tqf2Y0X6zRH_gvFe4uDO_gaG5M65YkDGVLnJk2Sdm4xNY_-97lA3m0_f8G_FzVHWinBDRA0JbSpp-dn9Tle8X8ymgalIrM92cxjsOA_y6j_J-Ad2hdOF93JVrIddTZfxA7CERmT4S8XcxOa9wyUyh_uMgzxjt9lKXzmgPueM8sSaYrAZ-YLuLv0M9x0vRmdQS8xQOKMOHH0hm4h2BHM1TPevLBgr15oeCX2iKFI0dsMRwoh5Q")' }}
          >
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">Turn Your Photos into Coloring Pages</h1>
              <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                Transform your cherished memories into unique coloring pages. Simply upload your photo, and our platform will convert it into a printable coloring page, perfect for kids and adults alike.
              </h2>
            </div>
            <button onClick={handleUploadClick} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#359dff] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]">
              <span className="truncate">Upload Photo</span>
            </button>
          </div>
        </div>
      </div>
      <h2 className="text-[#0c151d] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">How It Works</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        <div className="flex flex-1 gap-3 rounded-lg border border-[#cddcea] bg-slate-50 p-4 items-center">
          <div className="text-[#0c151d]"><svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,172l52-52,80,80H40Zm176,28H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z"></path></svg></div>
          <h2 className="text-[#0c151d] text-base font-bold leading-tight">Upload Your Photo</h2>
        </div>
        <div className="flex flex-1 gap-3 rounded-lg border border-[#cddcea] bg-slate-50 p-4 items-center">
          <div className="text-[#0c151d]"><svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120Zm96-96L147.31,64l24-24L216,84.68Z"></path></svg></div>
          <h2 className="text-[#0c151d] text-base font-bold leading-tight">Convert to Coloring Page</h2>
        </div>
        <div className="flex flex-1 gap-3 rounded-lg border border-[#cddcea] bg-slate-50 p-4 items-center">
          <div className="text-[#0c151d]"><svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,132.69V40a8,8,0,0,0-16,0v92.69L93.66,106.34a8,8,0,0,0-11.32,11.32Z"></path></svg></div>
          <h2 className="text-[#0c151d] text-base font-bold leading-tight">Download &amp; Print</h2>
        </div>
      </div>
      <h2 className="text-[#0c151d] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Examples</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
        <div className="flex flex-col gap-3"><div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC7ADUKWYbNNlLwWZhQw-IWBj9HvixARVBTBmWiVluBvKx3NbDnagodcwN0mUCYac3pTyVoGQFafANQvIBJYhUY9SaLdm17wX9k0VWCau_r4JRifFznrbdYcPDyVmcUb31yAZQV8WHQ8oR2wGnomFrCN-NGzrda2rqXwCRycRzxkzfEIR55pbM3XF1c45wv4RL9ywXO3McbrlBvd4Ji0EPfd739vYburBEOGUf8l9Z-JfyFhiQxp0PC6wu3Pv5s3_eQL_hdnlEGMEA")' }}></div></div>
        <div className="flex flex-col gap-3"><div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAsRvS3ArbfSdtx278ClE93fsygYm2S4UoSBPRvET85c4kf27gF4FHC2qtgZc7ZURywjbW6ZVRzeZhqcjN7vPfoNXF8gmnQXiE5U01M2U6xNcRL1hDpboztS3_6O_VUyCgpNGx4TnxGGpEDGOOvhwcO6DyX0RJ0nXpeFOBp2be1ubM1pF0bUIUwi7UlQp9p-jZmTnz7TXw7cGjBKQrYUHWbTvyEh3vbjMczWrTDdgdbLwS1Q0JWPKdsvvWMVq3e99h-UIIdiu10RLM")' }}></div></div>
        <div className="flex flex-col gap-3"><div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD5INbzt5l9eYHUCeAGa4aTAJfhdHtZDxbpH6b75GSk1Xjbu2uoZVD5kgoTM4W1QVz4HuJgD2e7EHsDWHutd3AVDWdf3SDJA5g-dgike5ZAeZgwWCHWum2dSPUckc7kxNbpg6eMUkD8dOjrH7I16T40w30bZ9o8IciXczxna-AXFRdic3s18HOD3325UiKD8m24pOp52sffbLYsbVCDsXuVOewExTuqKk2S1UnKzZF3rfc3gLTSPTal69_buGdk0QM2TOp36cF7IoM")' }}></div></div>
      </div>
      <div className="@container">
        <div className="flex flex-col justify-end gap-6 px-4 py-10 @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-[#0c151d] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">Ready to Get Started?</h1>
          </div>
          <div className="flex flex-1 justify-center"><div className="flex justify-center">
            <button onClick={handleUploadClick} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#359dff] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] grow">
              <span className="truncate">Upload Photo</span>
            </button>
          </div></div>
        </div>
      </div>
    </div>
  );
  
  const ResultsPage = () => (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 md:p-8">
        <div className="grid md:grid-cols-2 gap-8 w-full">
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-xl font-bold text-[#0c151d]">Original Photo</h2>
                <div className="w-full aspect-square rounded-lg border border-slate-200 p-2 bg-white shadow-md">
                    <img src={originalImage!} alt="Original upload" className="w-full h-full object-contain rounded"/>
                </div>
            </div>
            <div className="flex flex-col items-center gap-4">
                <h2 className="text-xl font-bold text-[#0c151d]">Your Coloring Page</h2>
                <div className="w-full aspect-square rounded-lg border border-slate-200 p-2 bg-white shadow-md flex items-center justify-center">
                    {isLoading && <div className="loader"></div>}
                    {error && <div className="text-center text-red-600 p-4">
                      <p className="font-semibold">Generation Failed</p>
                      <p className="text-sm">{error}</p>
                    </div>}
                    {coloringPage && <img src={coloringPage} alt="Generated coloring page" className="w-full h-full object-contain rounded cursor-pointer" onClick={() => setIsPreviewOpen(true)} />}
                </div>
            </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {coloringPage && (
              <a 
                href={coloringPage} 
                download="coloring-page.png"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-green-500 hover:bg-green-600 text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors"
              >
                  Download Page
              </a>
            )}
             <button 
                onClick={() => resetState()}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-slate-600 hover:bg-slate-700 text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors"
              >
                  Start Over
              </button>
        </div>
    </div>
  );

  const ImagePreviewModal = ({ imageUrl, onClose }: { imageUrl: string, onClose: () => void }) => (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative p-4 bg-white rounded-lg shadow-xl max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image container
      >
        <img src={imageUrl} alt="Coloring page preview" className="max-w-full max-h-[85vh] object-contain" />
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 text-black bg-white rounded-full h-8 w-8 flex items-center justify-center text-2xl font-bold hover:bg-gray-200 shadow-lg"
          aria-label="Close preview"
        >
          &times;
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root">
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        style={{ display: 'none' }}
        accept="image/*, .heic, .heif"
      />
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e6edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0c151d]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor"></path></svg>
            </div>
            <h2 className="text-[#0c151d] text-lg font-bold leading-tight tracking-[-0.015em]">ColorMe</h2>
          </div>
          <div className="flex flex-1 justify-end">
             <button onClick={originalImage ? () => resetState() : handleUploadClick} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#359dff] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors">
              <span className="truncate">{originalImage ? 'Start Over' : 'Upload Photo'}</span>
            </button>
          </div>
        </header>
        <main className="px-4 sm:px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
           {originalImage ? <ResultsPage /> : <LandingPage />}
        </main>
      </div>
      {isPreviewOpen && coloringPage && (
        <ImagePreviewModal imageUrl={coloringPage} onClose={() => setIsPreviewOpen(false)} />
      )}
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
