import { Teams } from "..";
import { Models } from "@/components/list/models";
const PanelContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="grid gap-5 lg:gap-7.5 items-stretch">
        <div className="lg:col-span-2">
          <Models></Models>
        </div>
      </div>
    </div>
  );
};
export { PanelContent };
