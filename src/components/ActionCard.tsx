import { QuickActionType } from "@/constants";
import { Card } from "./ui/card";

function ActionCard({ action, onClick }: { action: QuickActionType; onClick: () => void }) {
  // Define specific colors for each action to match the image
  const getActionColors = (title: string) => {
    switch (title) {
      case "New Call":
        return {
          bg: "bg-emerald-600",
          iconBg: "bg-emerald-600/20",
          iconColor: "text-emerald-600",
          hover: "hover:bg-emerald-700"
        };
      case "Join Interview":
        return {
          bg: "bg-purple-600",
          iconBg: "bg-purple-600/20",
          iconColor: "text-purple-600",
          hover: "hover:bg-purple-700"
        };
      case "Schedule":
        return {
          bg: "bg-blue-600",
          iconBg: "bg-blue-600/20",
          iconColor: "text-blue-600",
          hover: "hover:bg-blue-700"
        };
      case "Recordings":
        return {
          bg: "bg-orange-600",
          iconBg: "bg-orange-600/20",
          iconColor: "text-orange-600",
          hover: "hover:bg-orange-700"
        };
      default:
        return {
          bg: "bg-gray-600",
          iconBg: "bg-gray-600/20",
          iconColor: "text-gray-600",
          hover: "hover:bg-gray-700"
        };
    }
  };

  const colors = getActionColors(action.title);

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 cursor-pointer border-0 shadow-lg ${colors.bg} ${colors.hover}`}
      onClick={onClick}
    >
      {/* ACTION CONTENT WRAPPER */}
      <div className="relative p-6 size-full">
        <div className="space-y-4">
          {/* ACTION ICON */}
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-white/20 group-hover:scale-110 transition-transform`}>
            <action.icon className="h-6 w-6 text-white" />
          </div>

          {/* ACTION DETAILS */}
          <div className="space-y-1">
            <h3 className="font-semibold text-xl text-white">
              {action.title}
            </h3>
            <p className="text-sm text-white/80">{action.description}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ActionCard;
