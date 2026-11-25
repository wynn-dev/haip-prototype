import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

/**
 * On phones: the app, full-bleed. On wider screens: the same app inside an
 * iPhone 15 Pro–sized frame (393×852pt screen) with Dynamic Island, status bar,
 * side buttons and home indicator, scaled to fit the window.
 */
export function Device({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="device relative sm:h-[880px] sm:w-[421px] sm:shrink-0 sm:origin-center sm:rounded-[68px] sm:bg-[#0c0c0d] sm:p-[14px] sm:[transform:scale(var(--device-scale,1))] sm:shadow-[0_0_0_1.5px_#6e6e73,0_0_0_4px_#2c2c2e,0_0_0_5px_#4a4a4e,0_50px_100px_-20px_rgb(0_0_0/0.5),0_30px_60px_-30px_rgb(0_0_0/0.45)]">
        {/* side buttons: action, volume up/down, power */}
        <span className="absolute top-[118px] -left-[7px] hidden h-[32px] w-[4px] rounded-l-[3px] bg-[#3a3a3c] sm:block" />
        <span className="absolute top-[178px] -left-[7px] hidden h-[62px] w-[4px] rounded-l-[3px] bg-[#3a3a3c] sm:block" />
        <span className="absolute top-[254px] -left-[7px] hidden h-[62px] w-[4px] rounded-l-[3px] bg-[#3a3a3c] sm:block" />
        <span className="absolute top-[212px] -right-[7px] hidden h-[100px] w-[4px] rounded-r-[3px] bg-[#3a3a3c] sm:block" />

        <div id="screen" className="relative flex min-h-dvh flex-col bg-bg sm:h-full sm:min-h-0 sm:overflow-hidden sm:rounded-[54px] sm:[transform:translateZ(0)]">
          <StatusBar />
          <span aria-hidden className="pointer-events-none absolute top-[11px] left-1/2 z-[80] hidden h-[36px] w-[124px] -translate-x-1/2 rounded-full bg-black sm:block" />
          <div id="app" className="flex flex-1 flex-col sm:min-h-0 sm:overflow-y-auto sm:scrollbar-none">
            <Providers>{children}</Providers>
          </div>
          <span aria-hidden className="pointer-events-none absolute bottom-[8px] left-1/2 z-[80] hidden h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-label sm:block" />
          <Toaster position="bottom-center" offset={{ bottom: 104 }} mobileOffset={{ bottom: 96 }} />
        </div>
      </div>
      {/* scale the device to fit short windows */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){function f(){var s=Math.min(1,(innerHeight-32)/880,(innerWidth-32)/421);document.documentElement.style.setProperty('--device-scale',s)}f();addEventListener('resize',f)})()`,
        }}
      />
    </>
  );
}

function StatusBar() {
  return (
    <div aria-hidden className="hidden h-[54px] shrink-0 grid-cols-[1fr_124px_1fr] items-center pt-[4px] text-label select-none sm:grid">
      <span className="text-center text-[17px] font-semibold tracking-[-0.02em]">9:41</span>
      <span />
      <span className="flex items-center justify-center gap-[6px]">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.3c2.3 0 4.4.9 6 2.4l1.1-1.2A10.2 10.2 0 0 0 8 .6 10.2 10.2 0 0 0 .9 3.5L2 4.7a8.6 8.6 0 0 1 6-2.4Zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.1-1.2A6.9 6.9 0 0 0 8 4a6.9 6.9 0 0 0-4.7 1.9l1.1 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.4c.5 0 1 .2 1.3.5L8 11.4 6.7 9.6c.3-.3.8-.5 1.3-.5Z" /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3.8" stroke="currentColor" strokeOpacity=".4" /><rect x="2" y="2" width="19" height="9" rx="2.5" fill="currentColor" /><path d="M24 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" fillOpacity=".45" /></svg>
      </span>
    </div>
  );
}
