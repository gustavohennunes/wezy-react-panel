import { toAbsoluteUrl } from "@/utils";
const ScreenLoader = () => {
  return (
    <div className="relative w-full h-full min-h-[350px]">
      <div className="flex flex-col items-center gap-2 justify-center absolute inset-0 z-50 transition-opacity duration-700 ease-in-out">
        <img
          className="h-[60px] max-w-none"
          src={toAbsoluteUrl("/media/app/tube-spinner.svg")}
          alt="logo"
        />
      </div>
    </div>
  );
};
export { ScreenLoader };
